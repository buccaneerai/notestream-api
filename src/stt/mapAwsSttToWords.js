const {of} = require('rxjs');
const {filter, map, mergeMap} = require('rxjs/operators');

const mapAwsItemToWord = () => item => ({
  text: item.Content,
  end: item.EndTime,
  start: item.StartTime,
  confidence: null,
});

const filterEvents = () => event => (
  event.Transcript.Results[0]
  && event.Transcript.Results[0].IsPartial !== true
);

const mapEvent = () => event => (
  event.Transcript.Results[0].Alternatives[0].Items.map(mapAwsItemToWord())
);

const awsTransformer = () => source$ => source$.pipe(
  filter(filterEvents()),
  map(mapEvent()),
  mergeMap(words => of(...words))
);

module.exports = awsTransformer;
