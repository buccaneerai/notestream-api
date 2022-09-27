const {expect} = require('chai');
const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');

const {
  DISCONNECTION,
  NEW_STT_STREAM,
  STT_STREAM_STOP
} = require('./producer');
const consumeOneClientStream = require('./consumeOneClientStream');

const fakeAudioChunks = [
  Buffer.from('foo', 'base64'),
  Buffer.from('bar', 'base64'),
  Buffer.from('whatever', 'base64'),
];

const fakeWords = [
  {sttEngine: 'gcp', i: 0, start: 0, end: 1, confidence: 0.85, text: 'Hi'},
  {sttEngine: 'gcp', i: 1, start: 1, end: 2, confidence: 0.85, text: 'my'},
  {sttEngine: 'gcp', i: 2, start: 2, end: 3, confidence: 0.85, text: 'name'},
  {sttEngine: 'gcp', i: 3, start: 3, end: 4, confidence: 0.85, text: 'is'},
];

const fakeConfig = {
  audioEncoding: 'audio/l16',
  audioFileId: 'abcdefg',
  channels: 1,
  inputType: 's3File',
  sampleRate: 16000,
  sttEngines: [
    'aws-medical',
    'gcp',
    'ibm',
    'deepgram',
  ],
  ensemblers: ['tfEnsembler'],
  ensemblerOptions: {baselineSTTEngine: 'aws-medical'},
  sendSTTOutput: true,
  useRealtime: true,
  saveRawAudio: true,
  saveRawSTT: true,
  saveWords: true,
  saveWindows: true,
  runId: 'myrunid',
  windowLength: 20000,
  windowTimeoutInterval: 15000,
};

const fakeUpdateResponse = {updateRun: {_id: 'myrunid'}};

describe('consumeOneClientStream', () => {
  it('should export a curried function', () => {
    expect(consumeOneClientStream).to.be.a('function');
    expect(consumeOneClientStream()).to.be.a('function');
  });

  it('should return a correct stream given correct input data', marbles(m => {
    const context = {
      socket: {
        emit: sinon.spy(),
        handshake: {auth: {token: 'mytoken'}},
      },
    };
    const events = [
      {type: NEW_STT_STREAM, data: {context}},
      {type: STT_STREAM_STOP, data: {context}},
      {type: DISCONNECTION, data: {context}},
    ];
    const opts = {
      _createAudioStream: () => () => m.cold('-0-1--(2|)', fakeAudioChunks),
      _toSTT: () => () => m.cold('-012(3|)', fakeWords),
      _getStreamConfig: () => () => m.cold('-(0|)', [fakeConfig]),
      _createWindows: () => () => m.cold('-----|', []),
      _storeStatusUpdates: () => m.cold('-----(0|)', [fakeUpdateResponse]),
      returnOutputData: true,
    };
    const input$ = m.cold('-0----1(2|)', events);
    const actual$ = input$.pipe(consumeOneClientStream(opts));
    const expected$ = m.cold('-01234|', [
      {pipeline: 'runCreated', runId: fakeConfig.runId},
      ...fakeWords.map(w => ({...w, pipeline: 'stt'}))
    ]);
    m.expect(actual$).toBeObservable(expected$);
  }));
});
