const _ = require('lodash');
const roundTo = require('round-to');
const {combineLatest,of} = require('rxjs');
const {distinct,filter,map,mergeMap,scan,share} = require('rxjs/operators');

// track the furthest offset that each pipeline have reached
const trackLatestOffset = () => word$ => word$.pipe(
  map(w => w.end),
  scan((acc, timestamp) => timestamp > acc ? timestamp : acc, 0)
);

const createPipelineForEngine = word$ => engine => wordSub$.pipe(
  filter(w => w.sttEngine === engine),
  share()
);

// the lowest offset marks the latest word that can be considered "final"
const trackLatestOffsetForAll = () => allOffset$ => allOffset$.pipe(
  scan((acc, offsets) => _.min(offsets), 0),
  distinct()
);

const isPunctuation = w => ['.','?',',','!'].includes(w.text);

// cache words until all of the words for a time interval have been generated
const cacheWords = (acc, [latestOffset, nextWord]) => {
  const {priorOffset} = acc;
  if (latestOffset <= priorOffset) {
    const wordCache = [...acc.wordCache, nextWord];
    return {priorOffset, latestOffset, wordCache, finalizedWords: null};
  }
  const wordCache = [...acc.wordCache, nextWord].filter(
    w => w.end >= latestOffset
  );
  const finalizedWords = [...acc.wordCache, nextWord].filter(
    w => w.end <= latestOffset
  );
  return {
    latestOffset,
    wordCache,
    finalizedWords,
    priorOffset: latestOffset,
  };
};

const wordGroupReducer = (acc, w) => {
  const center = (w.start + w.end) / 2;
  const i = acc.findIndex(g => g.start <= center && g.end >= center);
  if (i < 0) return [...acc, {start: w.start, end: w.end, words: [w]}];
  const group = acc[i];
  const updatedGroup = {
    start: _.min([group.start, w.start]),
    end: _.max([group.end, w.end]),
    words: [...group.words, w]
  };
  const newGroups = [...acc];
  newGroups[i] = updatedGroup;
  return newGroups;
};

const groupOverlappingWords = words => {
  const sortedWords = _.sortBy(words, ['start']);
  const groups = sortedWords.reduce(wordGroupReducer, []);
  const wordGroups = groups.map(g => g.words);
  return wordGroups;
};

const candidatesReducer = numCandidates => (acc, w) => {
  if (numCandidates === 0) return [];
  const i = acc.findIndex(c => c.text.toLowerCase() === w.text.toLowerCase());
  if (i < 0) {
    return [
      ...acc,
      {
        ...w,
        count: 1,
        agreement: roundTo(1 / numCandidates, 2),
        numCandidates: numCandidates,
        sttEngine: 'ensemble',
      }
    ];
  }
  const candidates = [...acc];
  const candidate = candidates[i];
  candidates[i] = {
    text: candidate.text,
    start: _.min([candidate.start, w.start]),
    end: _.max([candidate.end, w.end]),
    confidence: _.max([candidate.confidence, w.confidence]),
    count: candidate.count + 1,
    agreement: roundTo((candidate.count + 1) / numCandidates, 2),
    numCandidates: numCandidates,
    sttEngine: 'ensemble',
  };
  return candidates;
};

const getCanonicalPicksFromCandidates = candidates => {
  const maxAgreement = _.max(candidates.map(_.property('agreement')));
  const maxConfidence = _.max(candidates.map(_.property('confidence')));
  // we trust super-high confidence results first
  if (maxConfidence >= 0.97) {
    const highConfidenceWord = candidates.find(
      c => c.confidence === maxConfidence
    );
    return [highConfidenceWord];
  }
  // if confidence is not extremely high, fall back to measuring consensus
  // between the STT engines
  const maxAgreementCandidates = candidates.filter(
    c => c.agreement === maxAgreement
  );
  if (maxAgreementCandidates.length === 1) return maxAgreementCandidates;
  // if there is more than one consensus candidate, use the one with the
  // highest confidence
  const rankedCandidates = _.sortBy(maxAgreementCandidates, ['confidence'])
    .reverse();
  return [rankedCandidates[0]];
};

const calculateCanonicalWordsFromGroups = () => groupedWords => {
  const [punctuations, words] = _.partition(groupedWords, isPunctuation);
  console.log('punctuations', punctuations);
  const candidatePunctuations = punctuations.reduce(
    candidatesReducer(punctuations.length)
    , []
  );
  const candidateWords = words.reduce(candidatesReducer(words.length), []);
  const canonicalPunctuation = (
    candidatePunctuations.length > 0
    ? getCanonicalPicksFromCandidates(candidatePunctuations)
    : []
  );
  const canonicalWords = (
    words.length > 0
    ? getCanonicalPicksFromCandidates(candidateWords)
    : []
  );
  const allCanonical = [...canonicalWords, ...canonicalPunctuation];
  console.log('allCanonical', allCanonical);
  const canonicalOutput = _.sortBy(allCanonical, ['start']);
  return canonicalOutput;
};

const calculateCanonicalWords = () => words => {
  const canonicalWords = groupOverlappingWords(words)
    .map(calculateCanonicalWordsFromGroups());
  return words;
};

const initialState = {
  priorOffset: 0,
  latestOffset: 0,
  wordCache: [],
  finalizedWords: null
};
const getCanonicalWords = (sttEngines, _initialState = initialState) => (
  offsetAndWords$ => offsetAndWords$.pipe(
    // cache words until all the words in each timeframe have arrived
    scan(cacheWords, _initialState),
    // release finalized words for processing
    map(state => _.get(state, 'finalizedWords', null)),
    filter(finalizedWords => finalizedWords),
    // calculate canonical words from all finalized words
    map(calculateCanonicalWords()),
    mergeMap(words => of(...words))
  )
);

const ensembleSTT = sttEngines => word$ => {
  const wordSub$ = word$.pipe(share());
  // break each STT engine into a separate stream
  const pipelines = sttEngines.map(createPipelineForEngine(wordSub$));
  // track the latest offset achieved by all the pipelines
  const offsets = pipelines.map(p$ => p$.pipe(trackLatestOffset()));
  const latestOffset$ = combineLatest(...offsets).pipe(
    trackLatestOffsetForAll()
  );
  const canonicalWord$ = combineLatest(latestOffset, word$).pipe(
    getCanonicalWords(sttEngines)
  );
  return canonicalWord$;
};

module.exports = ensembleSTT;
module.exports.testExports = {
  cacheWords,
  calculateCanonicalWords,
  calculateCanonicalWordsFromGroups,
  candidatesReducer,
  getCanonicalPicksFromCandidates,
  groupOverlappingWords,
  trackLatestOffset,
  createPipelineForEngine,
  trackLatestOffsetForAll,
  wordGroupReducer,
};
