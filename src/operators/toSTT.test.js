const {expect} = require('chai');
const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');
const {tap} = require('rxjs/operators');

const toSTT = require('./toSTT');
const {mapResponseToWord} = toSTT.testExports;

const fakeResponses = [
  {message: {text: 'foo', start: 0, end: 0.5, sttEngine: 'aws'}, topic: 'message'},
  {message: {text: 'foo', start: 0, end: 0.5, sttEngine: 'gcp'}, topic: 'message'},
];

describe('toSTT', () => {
  it('should export a function', () => {
    expect(toSTT).to.be.a('function');
  });

  it('should map API responses to word objects', () => {
    const actual = mapResponseToWord()(fakeResponses[0]);
    const expected = fakeResponses[0].message;
    expect(actual).to.equal(expected);
  });

  it('should return correct output stream given valid input stream', marbles(m => {
    const source$ = m.cold('----|', []);
    const fakeOut$ = m.cold('-0-1--|', fakeResponses);
    const params = {
      streamId: 'fakestream',
      runId: 'fakerun',
      inputType: 'audiofile',
      audioFileId: 'fakeaudiofile',
      sttEngines: ['aws', 'gcp'],
      ensemblers: ['tfEnsembler'],
      ensemblerOptions: {baselineSTTEngine: 'aws'},
      saveRawSTT: false,
      saveRawWords: false,
      _conduit: sinon.stub().returns(source$ => fakeOut$),
    };
    const out$ = source$.pipe(toSTT(params));
    const expected$ = m.cold('-0-1--|', fakeResponses.map(r => r.message));
    m.expect(out$).toBeObservable(expected$);
  }));
});
