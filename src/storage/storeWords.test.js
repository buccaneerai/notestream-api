const {expect} = require('chai');
const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');
const {of} = require('rxjs');
const {tap} = require('rxjs/operators');

const storeWords = require('./storeWords');

const fakeWords = [
  {
    start: 0,
    end: 0.8,
    text: 'soldiers',
    confidence: 0.9128385782241821,
    speakerTag: 0,
  },
  {
    start: 0.9,
    end: 1.4,
    text: 'Sailors',
    confidence: 0.9128385782241821,
    speakerTag: 0,
  },
];

describe('storeWords', () => {
  it('should export a function', () => {
    expect(storeWords).to.be.a('function');
  });

  it('should pass config to s3 storage operator', done => {
    const onData = sinon.spy();
    const onError = console.error;
    const emitter = sinon.spy();
    const toS3 = sinon.stub().returns(source$ => source$.pipe(tap(emitter)));
    const params = {
      runId: 'abc',
      options: {s3Bucket: 'mr-bucket', prefixDir: 'notestream/jobs'},
      _toS3File: toS3,
    };
    const source$ = of(...fakeWords);
    const out$ = source$.pipe(storeWords(params));
    // m.expect(out$).toBeObservable(source$);
    out$.subscribe(onData, onError, () => {
      expect(toS3.calledOnce).to.equal(true);
      expect(toS3.getCall(0).args[0]).to.deep.equal({
        s3Bucket: 'mr-bucket',
        s3Key: 'notestream/jobs/abc/words.csv',
        contentType: 'text/csv',
      });
      expect(emitter.calledOnce).to.be.equal(true);
      expect(emitter.getCall(0).args[0]).to.deep.equal('"start","end","text","confidence","speakerTag"\n0,0.8,"soldiers",0.9128385782241821,00.9,1.4,"Sailors",0.9128385782241821,0');
      expect(onData.callCount).to.equal(2);
      expect(onData.getCall(0).args[0]).to.deep.equal(fakeWords[0]);
      expect(onData.getCall(1).args[0]).to.deep.equal(fakeWords[1]);
      done();
    });
  }).timeout(2000);
});
