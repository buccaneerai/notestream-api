const _ = require('lodash');
const {expect} = require('chai');
const {marbles} = require('rxjs-marbles/mocha');
const sinon = require('sinon');
const {of} = require('rxjs');

const {NEW_STT_STREAM} = require('./producer');
const getStreamConfig = require('./getStreamConfig');
const {testExports} = getStreamConfig;
const {validate} = testExports;

const sampleConfig = {
  audioEncoding: 'LINEAR16',
  audioFileId: 'abcdefg',
  channels: 1,
  inputType: 's3File',
  sampleRate: 16000,
  sttEngines: [
    'aws-medical',
    'gcp',
    'ibm',
    'deepgram',
    // 'aws',
    // 'deepspeech',
  ],
  ensemblers: ['tfEnsembler'],
  ensemblerOptions: {baselineSTTEngine: 'aws-medical'},
  // preferredSttEngine: 'deepspeech',
  useRealtime: true,
  saveRawAudio: false,
  saveRawSTT: false,
  saveWords: false,
  saveWindows: false,
  runId: 'myrunid',
  windowLength: 20000,
  windowTimeoutInterval: 15000,
};

describe('getStreamConfig', () => {
  it('should throw an error observable when audioFileId is missing', marbles(m => {
    const event = {type: NEW_STT_STREAM, data: {invalid: 'config'}};
    const input$ = m.cold('--0-1-', [{type: 'foo', data: 'bar'}, event]);
    const actual$ = input$.pipe(getStreamConfig());
    const expected$ = m.cold(
      '----#',
      null,
      new Error('ValidationError: child "inputType" fails because ["inputType" is required]')
    );
    m.expect(actual$).toBeObservable(expected$);
  }));

  it('should return config when given a valid input observable', marbles(m => {
    const run = {createRun: {_id: 'myrunid'}};
    const _createRun = sinon.stub().returns(of(run));
    const event = {
      type: NEW_STT_STREAM,
      data: {audioFileId: 'abcdefg', inputType: 's3File'},
    };
    const input$ = m.cold('--0-1-', [{type: 'foo', data: 'bar'}, event]);
    const actual$ = input$.pipe(getStreamConfig({_createRun}));
    const expected$ = m.cold('----(0|)', [sampleConfig]);
    m.expect(actual$).toBeObservable(expected$);
    // m.expect(actual$).toHaveSubscriptions('^--');
  }));

  it('should return valid value when given valid input', () => {
    const input = {data: {audioFileId: 'abcdefg', inputType: 's3File'}};
    const validations = validate()(input);
    expect(validations.error).to.be.a('null');
    expect(validations.value).to.deep.equal(_.omit(sampleConfig, 'runId'));
  });

  it('should identify errors when given invalid input', () => {
    const input = {data: {foo: 'bar'}};
    const validations = validate()(input);
    expect(validations.error).to.not.be.a('null');
  });
});
