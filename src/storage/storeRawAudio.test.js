const {expect} = require('chai');
const sinon = require('sinon');
const {of} = require('rxjs');
const {map} = require('rxjs/operators');
const {marbles} = require('rxjs-marbles/mocha');

const storeRawAudio = require('./storeRawAudio');

describe('storeRawAudio', () => {
  it('should export a function', () => {
    expect(storeRawAudio).to.be.a('function');
  });

  it('should call s3 operator with correct parameters', () => {
    const initializedOperator = sinon.stub().returns(data => data);
    const operator = sinon.stub().returns(initializedOperator);
    const params = [
      'abc',
      {s3Bucket: 'mr-bucket', prefixDir: 'audio'},
      operator,
    ];
    const out$ = of('foo').pipe(storeRawAudio(...params));
    expect(operator.calledOnce).to.be.true;
    expect(operator.getCall(0).args[0]).to.deep.equal({
      s3Bucket: 'mr-bucket',
      s3Key: 'audio/abc/audio.linear16',
    });
  });

  it('should not alter input stream', marbles(m => {
    const operator = sinon.stub().returns(map(d => d));
    const params = [
      'abc',
      {s3Bucket: 'mr-bucket', prefixDir: 'audio'},
      operator,
    ];
    const fakeBuffers = [
      Buffer.from('0111', 'base64'),
      Buffer.from('1011100', 'base64'),
      Buffer.from('0011', 'base64'),
    ];
    const source$ = m.cold('0--1(2|)', fakeBuffers);
    const actual$ = source$.pipe(storeRawAudio(...params));
    const expected$ = m.cold('0--1(2|)', fakeBuffers);
    m.expect(actual$).toBeObservable(expected$);
  }));
});
