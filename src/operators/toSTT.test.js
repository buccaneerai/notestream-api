const {expect} = require('chai');
const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');
const {tap} = require('rxjs/operators');

const toSTT = require('./toSTT');
const {mapMessageToWord} = toSTT.testExports;

const fakeMessages = [
  {word: {text: 'foo', start: 0, end: 0.5, sttEngine: 'aws'}},
  {word: {text: 'foo', start: 0, end: 0.5, sttEngine: 'gcp'}},
];

describe('toSTT', () => {
  it('should export a function', () => {
    expect(toSTT).to.be.a('function');
  });

  it('should map API responses to word objects', () => {
    const actual = mapMessageToWord()(fakeMessages[0]);
    const expected = fakeMessages[0].word;
    expect(actual).to.equal(expected);
  });

  it('should return correct output stream given valid input stream', marbles(m => {
    const source$ = m.cold('----|', []);
    const fakeOut$ = m.cold('-0-1--|', fakeMessages);
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
    const expected$ = m.cold('-0-1--|', fakeMessages.map(m => m.word));
    m.expect(out$).toBeObservable(expected$);
  }));
});
