const _ = require('lodash');
const {of,zip} = require('rxjs');
const {filter,map,mergeMap,share} = require('rxjs/operators');

const errors = {
  invalidJSON: () => new Error('could not parse IBM event JSON'),
};

const parseJSON = eventStr => {
  let obs$;
  try {
    obs$ = of(JSON.parse(eventStr));
  } catch (e) {
    obs$ = of();
  }
  return obs$;
};

const mapResultToWords = () => result => (
  _.zip(
    _.get(result, 'alternatives[0].word_confidence', []),
    _.get(result, 'alternatives[0].timestamps', [])
  ).map(([confidenceResult, timestampResult]) => ({
    word: confidenceResult[0],
    confidence: confidenceResult[1],
    start: timestampResult[1],
    end: timestampResult[2],
  }))
);

const mapEventToWords = () => event => (
  _.get(event, 'results', [])
    .filter(result => result.final)
    .map(mapResultToWords())
    .flatMap(words => words)
);

const mapSpeakerEventToLabels = () => event => _.get(event, 'speaker_labels', []);

const filterWordEvents = () => event => (
  _.get(event, 'results.length', false)
);

const filterSpeakerEvents = () => event => _.get(event, 'speaker_labels', false);

const filterSpeakerForWord = word => speakerLabel => (
  speakerLabel.from <= ((word.start + word.end) / 2)
  && speakerLabel.to >= ((word.start + word.end) / 2)
);

const createWordsWithSpeakers = () => ([words, speakerLabels]) => (
  words.map(w => {
    const speakerLabel = speakerLabels.find(filterSpeakerForWord(w));
    return {
      ...w,
      speaker: _.get(speakerLabel, 'speaker', null),
      speakerConfidence: _.get(speakerLabel, 'confidence', null),
    };
  })
);

const createWordsStream = () => event$ => event$.pipe(
  filter(filterWordEvents()),
  map(mapEventToWords()),
  filter(words => words.length > 0)
);

const createSpeakerLabelsStream = () => event$ => event$.pipe(
  filter(filterSpeakerEvents()),
  map(mapSpeakerEventToLabels()),
);

const mapIBMSttToWords = () => ibmSTTEvent$ => {
  const eventSub$ = ibmSTTEvent$.pipe(
    mergeMap(parseJSON),
    share()
  );
  const words$ = eventSub$.pipe(createWordsStream());
  const speakerLabels$ = eventSub$.pipe(createSpeakerLabelsStream());
  const normalizedWord$ = zip(words$, speakerLabels$).pipe(
    map(createWordsWithSpeakers()),
    mergeMap(words => of(...words))
  );
  return normalizedWord$;
};

module.exports = mapIBMSttToWords;
module.exports.testExports = {
  createWordsWithSpeakers,
  createWordsStream,
  createSpeakerLabelsStream,
  filterSpeakerEvents,
  filterSpeakerForWord,
  filterWordEvents,
  mapResultToWords,
  mapEventToWords,
  parseJSON,
};
