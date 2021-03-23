const {expect} = require('chai');
const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');
const {of} = require('rxjs');
const {tap} = require('rxjs/operators');

const storeRunConfig = require('./storeRunConfig');

describe('storeRunConfig', () => {
  it('should export a function', () => {
    expect(storeRunConfig).to.be.a('function');
  });

  it('should pass config to s3 storage operator', done => {
    const fakeConfig = {foo: 'bar', runId: 'abc'};
    const onData = sinon.spy();
    const onError = console.error;
    const emitter = sinon.spy();
    const toS3 = sinon.stub().returns(source$ => source$.pipe(tap(emitter)));
    const params = [{s3Bucket: 'mr-bucket', prefixDir: 'notestream/jobs'}, toS3];
    const source$ = of(fakeConfig);
    const out$ = source$.pipe(storeRunConfig(...params));
    // m.expect(out$).toBeObservable(source$);
    out$.subscribe(onData, onError, () => {
      expect(toS3.calledOnce).to.equal(true);
      expect(toS3.getCall(0).args[0]).to.deep.equal({
        s3Bucket: 'mr-bucket',
        s3Key: 'notestream/jobs/abc/config.json',
        contentType: 'application/json',
      });
      expect(emitter.calledOnce).to.be.equal(true);
      expect(emitter.getCall(0).args[0]).to.deep.equal(JSON.stringify(fakeConfig));
      expect(onData.calledOnce).to.equal(true);
      expect(onData.getCall(0).args[0]).to.deep.equal(fakeConfig);
      done();
    });
  }).timeout(2000);
});
