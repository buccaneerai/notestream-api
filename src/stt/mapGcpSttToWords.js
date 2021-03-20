import _ from 'lodash';
import { of, throwError } from 'rxjs';
import { map, mergeMap, filter } from 'rxjs/operators';
import trace from './trace';

const mapGcpWordToWord = () => w => ({
  text: w.word,
  start: Number.parseInt(w.startTime.seconds, 10) + w.startTime.nanos / 1000000000,
  end: Number.parseInt(w.endTime.seconds, 10) + w.endTime.nanos / 1000000000,
  confidence: w.confidence,
  speakerTag: w.speaker_tag,
});

const filterEvents = () => event => _.get(event, 'results[0]', false);

// event[0] may cause us to miss events, but right now it is always [{}, null, null]
// results[0] is the transcript
// results[1] will give us speaker diarization if we want it
// currently I have it removed
const mapEvent = () => event => {
  const words = _.get(event, 'results[0].alternatives[0].words', []);
  return words.map(mapGcpWordToWord()).flat();
};
  // event[0].results[0].alternatives[0].words.map(mapGcpWordToWord()).flat();

const mapGcpSttToWords = () => source$ => (
  source$.pipe(
    trace('gcp.out'),
    mergeMap(event => event.error ? throwError(event.error) : of(event)),
    filter(filterEvents()),
    map(mapEvent()),
    mergeMap(words => of(...words))
  )
);

export default mapGcpSttToWords;
