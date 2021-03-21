const {expect} = require('chai');
const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');
const {mapTo} = require('rxjs/operators');

const stt = require('./fileChunkToSTT');
const {testExports} = stt;
const {pipelineReducer} = testExports;

const buffers = [
  Buffer.from('abc'),
  Buffer.from('def'),
  Buffer.from('xyz'),
];

describe('stt', () => {
  it('should pass fileChunks into downstream STT pipelines', marbles(m => {
    const awsOut = [
      {text: 'hello', sttEngine: 'aws'},
      {text: 'world', sttEngine: 'aws'},
    ];
    const deepspeechOut = [
      {text: 'high', sttEngine: 'deepspeech'},
      {text: 'lo', sttEngine: 'deepspeech'},
      {text: 'world', sttEngine: 'deepspeech'},
    ];
    const sttOut0$ = m.cold('--0-(1|)', awsOut);
    const sttOut1$ = m.cold('01-(2|)', deepspeechOut);
    const reducerStub = sinon.stub();
    reducerStub.onCall(0).returns([sttOut0$]);
    reducerStub.onCall(1).returns([sttOut0$, sttOut1$]);
    const params = {
      sttEngines: ['deepspeech', 'aws'],
      _pipelineReducer: () => reducerStub,
    };
    const input$ = m.cold('--0-1-(2|)', buffers);
    const actual$ = input$.pipe(stt(params));
    const expected$ = m.cold('0123(4|)', [
      deepspeechOut[0],
      deepspeechOut[1],
      awsOut[0],
      deepspeechOut[2],
      awsOut[1],
    ]);
    // m.expect(input$).toHaveSubscriptions('^------!');
    m.expect(actual$).toBeObservable(expected$);
  }));

  it('should properly compose stt pipelines', marbles(m => {
    const fileChunk$ = m.cold('0--1--(2|)', buffers);
    const pipelines = {
      deepgram: {
        options: {username: 'foo', password: 'bar'},
        operator: sinon.stub().returns(mapTo({data: 'deepgram'})),
        transformer: sinon.stub().returns(mapTo({data: 'deepgramtransformed'})),
      },
      deepspeech: {
        options: {foo: 'bar'},
        operator: sinon.stub().returns(mapTo({data: 'deepspeech'})),
        transformer: sinon.stub().returns(obs$ => obs$),
      },
      gcp: {options: {}},
    };
    const reducer = pipelineReducer({fileChunk$, pipelines});
    const engines = ['deepgram', 'deepspeech'];
    const pipelinesOut = engines.reduce(reducer, []);
    expect(pipelinesOut.length).to.equal(2);
    m.expect(pipelinesOut[0]).toBeObservable(m.cold(
      '0--1--(2|)',
      [
        {data: 'deepgramtransformed', sttEngine: 'deepgram', i: 0},
        {data: 'deepgramtransformed', sttEngine: 'deepgram', i: 1},
        {data: 'deepgramtransformed', sttEngine: 'deepgram', i: 2},
      ]
    ));
    m.expect(pipelinesOut[1]).toBeObservable(m.cold(
      '0--1--(2|)',
      [
        {data: 'deepspeech', sttEngine: 'deepspeech', i: 0},
        {data: 'deepspeech', sttEngine: 'deepspeech', i: 1},
        {data: 'deepspeech', sttEngine: 'deepspeech', i: 2},
      ]
    ));
  }));
});
