const {expect} = require('chai');
const sinon = require('sinon');
const {marbles} = require('rxjs-marbles');

const createInputStream = require('./createAudioStream');
const {testExports} = createInputStream;
const {errors} = testExports;

describe('createAudioStream', () => {
  it('should export a function', () => {
    expect(createInputStream).to.be.a('function');
    expect(createInputStream({foo: 'bar'})).to.be.a('function');
  });

  it('should return a correct stream for s3File input type given valid input', marbles(m => {
    const config = {inputType: 's3File', audioFileId: 'foobar'};
    const buffers = [Buffer.from([1]), Buffer.from([2])];
    const message = {type: 'NEW_STT_STREAM', data: {config}};
    const buffer$ = m.cold('--01|', buffers);
    const params = {
      config,
      _ingestAudioFromStorage: sinon.stub().returns(buffer$),
    };
    const input$ = m.cold('-0---', [message]);
    const actual$ = input$.pipe(createInputStream(params));
    const expected$ = m.cold('--01|', buffers);
    m.expect(actual$).toBeObservable(expected$);
  }));

  it('should throw an error for an unknown input type', marbles(m => {
    const config = {inputType: 'unknownType'};
    const message = {type: 'NEW_STT_STREAM', data: {config}};
    const params = {config};
    const input$ = m.cold('-0---', [message]);
    const actual$ = input$.pipe(createInputStream(params));
    const expected$ = m.cold('#', null, errors.unknownInputType());
    m.expect(actual$).toBeObservable(expected$);
  }));
});
