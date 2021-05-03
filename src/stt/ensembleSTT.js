const _ = require('lodash');
const {combineLatest} = require('rxjs');
const {distinct,filter,map,scan,share} = require('rxjs/operators');

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

const initialState = {
  priorOffset: 0,
  latestOffset: 0,
  wordCache: [],
  finalizedWords: null
};
const getCanonicalWords = (_initialState = initialState) => (
  offsetAndWords$ => offsetAndWords$.pipe(
    scan(cacheWords, _initialState)
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
    getCanonicalWords()
  );
  return canonicalWord$;
};

module.exports = ensembleSTT;
module.exports.testExports = {
  cacheWords,
  trackLatestOffset,
  createPipelineForEngine,
  trackLatestOffsetForAll,
};
