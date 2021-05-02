const _ = require('lodash');
const {of} = require('rxjs');
const {map, mergeMap, filter} = require('rxjs/operators');

const mapDeepspeechWordToWord = () => w => ({
  text: w.word,
  end: w.end,
  start: w.start,
  confidence: w.confidence,
  speaker: _.get(w, 'speaker', null),
  speakerConfidence: null,
});

const filterEvents = () => event => (
  _.get(event, 'is_final', false)
  &&
  _.get(event, 'channel.alternatives[0]', false)
);

const mapEvent = () => event => (
  event.channel.alternatives[0].words.map(mapDeepspeechWordToWord())
);

const mapDeepgramSttToWords = () => source$ => source$.pipe(
  filter(filterEvents()),
  map(mapEvent()),
  mergeMap(words => of(...words))
);

module.exports = mapDeepgramSttToWords;
