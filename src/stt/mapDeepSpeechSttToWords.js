const { of } = require('rxjs');
const { filter, map, mergeMap } = require('rxjs/operators');

const filterEvents = () => event => event.transcripts.length;

const mapDeepSpeechWordToWord = transcript => word => ({
  text: word.text,
  end: word.endTime,
  start: word.startTime,
  confidence: transcript.confidence,
});

const mapEventToWords = () => event =>
  event.transcripts[0].words.map(mapDeepSpeechWordToWord(event.transcripts[0]));

const mapDeepSpeechSttToWords = () => source$ =>
  source$.pipe(
    filter(filterEvents()),
    map(mapEventToWords()),
    mergeMap(words => of(...words))
  );

module.exports = mapDeepSpeechSttToWords;
