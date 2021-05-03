const {combineLatest} = require('rxjs');
const {tap} = require('rxjs/operators');
const {expect} = require('chai');
// const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');

const ensembleSTT = require('./ensembleSTT');
const {testExports} = ensembleSTT;
const {
  cacheWords,
  trackLatestOffset,
  createPipelineForEngine,
  trackLatestOffsetForAll,
} = testExports;

describe('ensembleSTT', () => {
  it('should export a function', () => {
    expect(ensembleSTT).to.be.a('function');
    expect(ensembleSTT()).to.be.a('function');
  });

  it('should track latest offset for each stream', marbles(m => {
    const words = [
      {end: 0.67},
      {end: 2.56},
      {end: 20.56},
      {end: 30.89},
      {end: 5.67},
    ];
    const in$ = m.cold('-0123-(4|)', words);
    const actual$ = in$.pipe(trackLatestOffset());
    const expected$ = m.cold('-0123-(4|)', [
      words[0].end,
      words[1].end,
      words[2].end,
      words[3].end,
      words[3].end,
    ]);
    m.expect(actual$).toBeObservable(expected$);
  }));

  it('should track latest offset for all streams', marbles(m => {
    const words0 = [
      0.67,
      2.56,
      20.56,
      30.89,
      32.33,
    ];
    const words1 = [
      0.98,
      3.56,
      6.67,
      22.56,
      31.89,
    ];
    const in0$ = m.cold('--0--12----3----(4|)', words0);
    const in1$ = m.cold('0-1-2-3-(4|)', words1);
    const actual$ = combineLatest(in0$, in1$).pipe(
      tap(console.log),
      trackLatestOffsetForAll()
    );
    const expected$ = m.cold('--0--1(23)-(5)--(6|)', [
      0.67,
      2.56,
      6.67,
      20.56,
      22.56,
      30.89,
      31.89,
    ]);
    m.expect(actual$).toBeObservable(expected$);
  }));

  it('should realease cache of final words if prior offset differs from latest offset', () => {
    const acc = {
      priorOffset: 15.66,
      latestOffset: 15.66,
      wordCache: [
        {end: 16.55, text: 'so'},
        {end: 19.55, text: 'cute'},
        {end: 30.65, text: 'obese'},
        {end: 25.55, text: 'pug'},
      ],
      finalizedWords: null,
    };
    const next = [20.55, {end: 19.50, text: 'foo'}];
    const actual = cacheWords(acc, next);
    const expected = {
      priorOffset: 20.55,
      latestOffset: 20.55,
      wordCache: [acc.wordCache[2], acc.wordCache[3]],
      finalizedWords: [acc.wordCache[0], acc.wordCache[1], next[1]],
    };
    expect(actual).to.deep.equal(expected);
  });

  it('should cache of words if prior offset is less than or equal to latest offset', () => {
    const state = {
      priorOffset: 20.55,
      wordCache: [
        {end: 30.65, text: 'obese'},
        {end: 25.55, text: 'pug'},
      ],
      finalizedWords: [
        {end: 16.55, text: 'so'},
        {end: 19.55, text: 'cute'},
        {end: 19.50, text: 'foo'},
      ],
    };
    const next = [20.55, {end: 21.50, text: 'bar'}];
    const actual = cacheWords(state, next);
    const expected = {
      priorOffset: 20.55,
      latestOffset: 20.55,
      wordCache: [
        state.wordCache[0],
        state.wordCache[1],
        next[1],
      ],
      finalizedWords: null,
    };
    expect(actual).to.deep.equal(expected);
  });
});
