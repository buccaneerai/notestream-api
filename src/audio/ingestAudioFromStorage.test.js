const {expect} = require('chai');
const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');
const {tap} = require('rxjs/operators');

const ingestAudioFromStorage = require('./ingestAudioFromStorage');

describe('ingestAudioFromStorage', () => {
  it('should export a function', () => {
    expect(ingestAudioFromStorage).to.be.a('function');
  });

  it('should run workflow correctly given valid inputs', marbles(m => {
    const config = {audioFileId: 'foobar'};
    const buffers = [Buffer.from([0]), Buffer.from([1]), Buffer.from([2])];
    const buffer$ = m.cold('-0-1-(2|)', buffers);
    const audioFileResponse = {audioFiles: [{s3Key: 'foo', s3Bucket: 'bar'}]};
    const audioResponse$ = m.cold('--(0|)', [audioFileResponse]);
    const params = {
      config,
      _gql: {
        findAudioFiles: sinon.stub().returns(audioResponse$),
      },
      _streamS3Audio: sinon.stub().returns(buffer$),
      _logger: {info: () => 1, error: () => 1, toLog: tap},
    };
    const actual$ = ingestAudioFromStorage(params);
    const expected$ = m.cold('---0-1-(2|)', buffers);
    m.expect(actual$).toBeObservable(expected$);
  }));
});
