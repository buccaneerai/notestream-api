const _ = require('lodash');
const {expect} = require('chai');
const {marbles} = require('rxjs-marbles/mocha');
const sinon = require('sinon');
const {of} = require('rxjs');

const {NEW_STT_STREAM,RESUME_STREAM} = require('./producer');
const getStreamConfig = require('./getStreamConfig');
const {testExports} = getStreamConfig;
const {validate} = testExports;

const sampleConfig = {
  audioEncoding: 'audio/l16',
  audioFileId: 'abcdefg',
  channels: 1,
  inputType: 's3File',
  sampleRate: 16000,
  isResume: false,
  sttEngines: [
    'fathom'
  ],
  ensemblers: ['tfEnsembler'],
  ensemblerOptions: {baselineSTTEngine: 'gcp'},
  // preferredSttEngine: 'deepspeech',
  sendSTTOutput: false,
  useRealtime: true,
  saveRawAudio: true,
  saveRawSTT: true,
  saveWords: true,
  saveWindows: true,
  accountId: 'myaccountid',
  runId: 'myrunid',
  windowLength: 20000,
  windowTimeoutInterval: 15000,
};

describe('getStreamConfig', () => {
  it('should throw an error observable when audioFileId is missing', marbles(m => {
    const event = {
      type: NEW_STT_STREAM,
      data: {
        invalid: 'config',
        context: {socket: {handshake: {auth: {token: 'mytoken'}}}},
      },
    };
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
    const createRun = sinon.stub().returns(of(run));
    const encounter = {encounters: [{_id: 'myencounterid', accountId: 'myaccountid'}]};
    const findEncounters = sinon.stub().returns(of(encounter));
    const _gql = () => ({createRun,findEncounters});
    const event = {
      type: NEW_STT_STREAM,
      data: {
        audioFileId: 'abcdefg',
        inputType: 's3File',
        context: {socket: {handshake: {auth: {token: 'mytoken'}}}},
      },
    };
    const input$ = m.cold('--0-1-', [{type: 'foo', data: 'bar'}, event]);
    const actual$ = input$.pipe(getStreamConfig({_gql}));
    const expected$ = m.cold('----(0)', [sampleConfig]);
    m.expect(actual$).toBeObservable(expected$);
    expect(createRun.callCount).to.equal(0);
  }));

  it('should return an audioCheckpoint from existing run when given a resume stream input and does not create a new run', marbles(m => {
    const runs = {runs: [{_id: 'myrunid', accountId: 'myaccountid', audioCheckpoint: {start: 5, end: 10}}]};
    const createRun = sinon.stub().returns(of());
    const findRuns = sinon.stub().returns(of(runs));
    const encounter = {encounters: [{_id: 'myencounterid', accountId: 'myaccountid'}]};
    const findEncounters = sinon.stub().returns(of(encounter));
    const _gql = () => ({findRuns,findEncounters,createRun});
    const event = {
      type: RESUME_STREAM,
      data: {
        runId: 'myrunid',
        audioFileId: 'abcdefg',
        inputType: 's3File',
        context: {socket: {handshake: {auth: {token: 'mytoken'}}}},
      },
    };
    const input$ = m.cold('--0-1-', [{type: 'foo', data: 'bar'}, event]);
    const actual$ = input$.pipe(getStreamConfig({_gql}));
    const expected$ = m.cold('----(0)', [{
      ...sampleConfig,
      isResume: true,
      audioCheckpoint: {
          start: 5,
          end: 10
      }
    }]);
    m.expect(actual$).toBeObservable(expected$);
  }));

  it('should throw unauthorized if no token is present', marbles(m => {
    const run = {createRun: {_id: 'myrunid'}};
    const createRun = sinon.stub().returns(of(run));
    const _gql = () => ({createRun});
    const event = {
      type: NEW_STT_STREAM,
      data: {
        audioFileId: 'abcdefg',
        inputType: 's3File',
        context: {socket: {handshake: {auth: {token: null}}}},
      },
    };
    const input$ = m.cold('--0-1-', [{type: 'foo', data: 'bar'}, event]);
    const actual$ = input$.pipe(getStreamConfig({_gql}));
    const expected$ = m.cold('----#', null, new Error('unauthorized'));
    m.expect(actual$).toBeObservable(expected$);
    // m.expect(actual$).toHaveSubscriptions('^--');
  }));

  it('should return valid value when given valid input', () => {
    const input = {data: {audioFileId: 'abcdefg', inputType: 's3File'}};
    const validations = validate()(input);
    expect(validations.error).to.be.a('null');
    expect(validations.value).to.deep.equal(_.omit(sampleConfig, ['runId', 'accountId']));
  });

  it('should identify errors when given invalid input', () => {
    const input = {data: {foo: 'bar'}};
    const validations = validate()(input);
    expect(validations.error).to.not.be.a('null');
  });
});
