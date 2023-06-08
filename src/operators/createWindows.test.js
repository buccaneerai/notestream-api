const {expect} = require('chai');
// const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');

const createWindows = require('./createWindows');

describe('createWindows', marbles(m => {
  it('should export a function', () => {
    expect(createWindows).to.be.a('function');
  });

  it('should close window if timeout emits before all words', marbles(m => {
    const words = [
      {text: '0', start: 0, end: 1},
      {text: '1', start: 1, end: 2},
      {text: '2', start: 2, end: 3},
      {text: '3', start: 3, end: 4},
      {text: '4', start: 4, end: 5},
    // adjust word timings to account for ticks versus milliseconds
    ].map(w => ({...w, start: w.start / 1000, end: w.end / 1000}));
    const word$ = m.cold('-0123(4|)', words);
    const params = {
      runId: 'myrun',
      saveWindows: false,
      windowLength: 5,
      windowTimeoutInterval: 3,
    };
    const window$ = word$.pipe(
      createWindows(params)
    );
    const expected$ = m.cold('---(0|)', [
      [words[0], words[1], words[2]]
    ]);
    m.expect(window$).toBeObservable(expected$);
  }));

  it('should close window if all words have been emitted', marbles(m => {
    const words = [
      {text: '0', start: 0, end: 1},
      {text: '1', start: 1, end: 2},
      {text: '2', start: 2, end: 3},
      {text: '3', start: 3, end: 4},
      {text: '4', start: 4, end: 5},
    ].map(w => ({...w, start: w.start / 1000, end: w.end / 1000}));
    const word$ = m.cold('-0123(4|)', words);
    const params = {
      runId: 'myrun',
      saveWindows: false,
      windowLength: 4,
      windowTimeoutInterval: 5,
    };
    const window$ = word$.pipe(
      createWindows(params)
    );
    const expected$ = m.cold('-----(0|)', [words]);
    m.expect(window$).toBeObservable(expected$);
  }));
});
