import {of} from 'rxjs';
import {map, mergeMap, filter} from 'rxjs/operators';

const mapDeepspeechWordToWord = () => w => ({
  text: w.word,
  end: w.end,
  start: w.start,
  confidence: w.confidence,
});

const filterEvents = () => event => (
  event.is_final && event.channel.alternatives[0]
);

const mapEvent = () => event => (
  event.channel.alternatives[0].words.map(mapDeepspeechWordToWord())
);

const mapDeepgramSttToWords = () => source$ => source$.pipe(
  filter(filterEvents()),
  map(mapEvent()),
  mergeMap(words => of(...words))
);

export default mapDeepgramSttToWords;
