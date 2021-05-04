const _ = require('lodash');
const {combineLatest} = require('rxjs');
const {tap} = require('rxjs/operators');
const {expect} = require('chai');
// const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');

const ensembleSTT = require('./ensembleSTT');
const {testExports} = ensembleSTT;
const {
  cacheWords,
  calculateCanonicalWords,
  calculateCanonicalWordsFromGroups,
  candidatesReducer,
  groupOverlappingWords,
  trackLatestOffset,
  createPipelineForEngine,
  getCanonicalPicksFromCandidates,
  trackLatestOffsetForAll,
  wordGroupReducer
} = testExports;

 const sampleWords = [
  {text: 'There', sttEngine: 'ibm', confidence: 0.97, start: 0, end: 0.95},
  {text: 'there', sttEngine: 'gcp', confidence: 0.86, start: 0.53, end: 0.99},
  {text: 'The',   sttEngine: 'aws', confidence: 0.76 , start: 0.56, end: 0.84},
  {text: 'thar',  sttEngine: 'deepgram', confidence: 0.65, start: 0.50, end: 0.96},
  {text: 'is', sttEngine: 'ibm', confidence: 0.88, start: 1.01, end: 1.11},
  {text: 'is', sttEngine: 'gcp', confidence: 0.94, start: 1.11, end: 1.15},
  {text: 'is', sttEngine: 'aws', confidence: 0.99, start: 1.05, end: 1.15},
  {text: 'was', sttEngine: 'deepgram', confidence: 0.77, start: 1.02, end: 1.15},
  {text: 'always', sttEngine: 'ibm', confidence: 0.97, start: 1.20, end: 1.30},
  {text: 'ways', sttEngine: 'gcp', confidence: 0.86, start: 1.21, end: 1.31},
  {text: 'all',   sttEngine: 'aws', confidence: 0.76, start: 1.19, end: 1.29},
  {text: 'ways', sttEngine: 'aws', confidence: 0.67, start: 1.20, end: 1.30},
  {text: 'alls',  sttEngine: 'deepgram', confidence: 0.65, start: 1.25, end: 1.30},
  {text: 'money', sttEngine: 'ibm', confidence: 0.97, start: 1.35, end: 1.50},
  {text: 'in', sttEngine: 'ibm', confidence: 0.94, start: 1.55, end: 1.60},
  {text: 'on', sttEngine: 'gcp', confidence: 0.94, start: 1.55, end: 1.59},
  {text: 'inn', sttEngine: 'aws', confidence: 0.80, start: 1.55, end: 1.65},
  {text: 'win', sttEngine: 'deepgram', confidence: 0.77, start: 1.55, end: 1.62},
  {text: 'the', sttEngine: 'ibm', confidence: 0.97, start: 1.70, end: 1.80},
  {text: 'the', sttEngine: 'gcp', confidence: 0.86, start: 1.70, end: 1.80},
  {text: 'the',   sttEngine: 'aws', confidence: 0.76, start: 1.70, end: 1.80 },
  {text: 'the',  sttEngine: 'deepgram', confidence: 0.65, start: 1.70, end: 1.80},
  {text: 'banana', sttEngine: 'ibm', confidence: 0.97, start: 1.90, end: 2.0},
  {text: 'banana', sttEngine: 'gcp', confidence: 0.86, start: 1.90, end: 2.0},
  {text: 'havanna',   sttEngine: 'aws', confidence: 0.76, start: 1.90, end: 2.0 },
  {text: 'havanna',  sttEngine: 'deepgram', confidence: 0.65, start: 1.90, end: 2.0},
  {text: 'stand', sttEngine: 'ibm', confidence: 0.97, start: 2.05, end: 2.15},
  {text: 'stand', sttEngine: 'gcp', confidence: 0.86, start: 2.05, end: 2.15},
  {text: 'stand',   sttEngine: 'aws', confidence: 0.76, start: 2.05, end: 2.15 },
  {text: 'stand',  sttEngine: 'deepgram', confidence: 0.65, start: 2.05, end: 2.15},
  {text: '.', sttEngine: 'aws', confidence: 0.86, start: 2.15, end: 2.15},
  {text: '.', sttEngine: 'ibm', confidence: 0.56, start: 2.15, end: 2.15},
];

describe('ensembleSTT', () => {
  it('should export a function', () => {
    expect(ensembleSTT).to.be.a('function');
    expect(ensembleSTT()).to.be.a('function');
  });

  it('should calculate canonical words by combining words from all engines', () => {
    const sttEngines = ['ibm', 'aws', 'gcp', 'deepgram'];
    const actual = calculateCanonicalWords(sttEngines)(sampleWords);
    const expected = [
      {
        text: 'There',
        start: 0,
        end: 0.99,
        confidence: 0.97,
        sttEngine: 'ensemble',
        count: 2,
        agreement: 0.50,
        numCandidates: 4,
      },
      // {
      //   text: 'is'
      // },
      // {
      //   text: 'always'
      // },
      // {text: 'money'},
      // {text: 'in'},
      // {text: 'the'},
      // {text: 'banana'},
      // {text: 'stand'},
      // {text: '.'},
    ];
    expect(actual).to.deep.equal(expected);
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

  it('should generate correct groups for overlapping words', () => {
    const groups = sampleWords.reduce(wordGroupReducer,[]);
    console.log('groups', groups);
    expect(groups.length).to.equal(9);
    expect(groups[0].start).to.equal(0);
    expect(groups[0].end).to.equal(0.99);
    expect(groups[0].words).to.deep.equal(_.take(sampleWords, 4));
  });

  it('should group words together correctly based on overlapping intervals', () => {
    const wordGroups = groupOverlappingWords(sampleWords);
    expect(wordGroups[0]).to.be.an('array');
    expect(wordGroups[4]).to.deep.equal([
      sampleWords[14],
      sampleWords[15],
      sampleWords[16],
      sampleWords[17],
    ]);
  });

  it('should calculate canonical words from groups', () => {
    const words = [
      {text: 'There', sttEngine: 'ibm', confidence: 0.97, start: 0, end: 0.95},
      {text: 'there', sttEngine: 'gcp', confidence: 0.86, start: 0.53, end: 0.99},
      {text: 'The',   sttEngine: 'aws', confidence: 0.76 , start: 0.56, end: 0.84},
      {text: 'thar',  sttEngine: 'deepgram', confidence: 0.65, start: 0.50, end: 0.96},
    ];
    const actual = calculateCanonicalWordsFromGroups()(words);
    const expected = [{
      text: 'There',
      start: 0,
      end: 0.99,
      confidence: 0.97,
      sttEngine: 'ensemble',
      count: 2,
      agreement: 0.5,
      numCandidates: 4,
    }];
    expect(actual).to.deep.equal(expected);
  });

  it('should generate candidates from group of words', () => {
    const words = [
      {text: 'There', sttEngine: 'ibm', confidence: 0.97, start: 0, end: 0.95},
      {text: 'there', sttEngine: 'gcp', confidence: 0.86, start: 0.53, end: 0.99},
      {text: 'The',   sttEngine: 'aws', confidence: 0.76 , start: 0.56, end: 0.84},
      {text: 'thar',  sttEngine: 'deepgram', confidence: 0.65, start: 0.50, end: 0.96},
    ];
    const actual = words.reduce(candidatesReducer(4), []);
    const expected = [
      {
        text: 'There',
        start: 0,
        end: 0.99,
        confidence: 0.97,
        sttEngine: 'ensemble',
        count: 2,
        agreement: 0.50,
        numCandidates: 4,
      },
      {
        text: 'The',
        start: 0.56,
        end: 0.84,
        confidence: 0.76,
        sttEngine: 'ensemble',
        count: 1,
        agreement: 0.25,
        numCandidates: 4,
      },
      {
        text: 'thar',
        start: 0.50,
        end: 0.96,
        confidence: 0.65,
        sttEngine: 'ensemble',
        count: 1,
        agreement: 0.25,
        numCandidates: 4,
      },
    ];
    expect(actual).to.deep.equal(expected);
  });

  it('should prefer high-confidence predictions first when selecting canonical words', () => {
    const candidates = [
      {text: 'somethin', confidence: 0.76, agreement: 0.25},
      {text: 'foo', confidence: 0.99, agreement: 0.25},
      {text: 'bar', confidence: 0.85, agreement: 0.50},
    ];
    const actual = getCanonicalPicksFromCandidates(candidates);
    const expected = [candidates[1]];
    expect(actual).to.deep.equal(expected);
  });

  it('should use agreement metric to select words when high-confidence candidate is absent', () => {
    const candidates = [
      {text: 'somethin', confidence: 0.76, agreement: 0.25},
      {text: 'foo', confidence: 0.93, agreement: 0.25},
      {text: 'bar', confidence: 0.85, agreement: 0.50},
    ];
    const actual = getCanonicalPicksFromCandidates(candidates);
    const expected = [candidates[2]];
    expect(actual).to.deep.equal(expected);
  });

  it('should prefer highest-confidedence candidate when agreement metric is a wash', () => {
    const candidates = [
      {text: 'somethin', confidence: 0.76, agreement: 0.50},
      {text: 'bar', confidence: 0.85, agreement: 0.50},
      {text: 'foo', confidence: 0.93, agreement: 0},
    ];
    const actual = getCanonicalPicksFromCandidates(candidates);
    const expected = [candidates[1]];
    expect(actual).to.deep.equal(expected);
  });
});
