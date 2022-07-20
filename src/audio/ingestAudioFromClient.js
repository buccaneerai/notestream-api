const get = require('lodash/get');
// const {of,throwError} = require('rxjs');
const {
  filter,
  map,
  // mergeMap,
  share,
  takeUntil
} = require('rxjs/operators');
// const isBase64 = require('is-base64');

const {
  NEXT_AUDIO_CHUNK,
  STT_STREAM_DONE,
  STT_STREAM_STOP,
  // NEW_STT_STREAM
} = require('../ws/producer');

// const errors = {
//   notBase64: () => new Error('audio data must be valid base64'),
// };

const ingestAudioFromClient = () => {
  // note that in theory, a websocket could broadcast multiple audio streams, either
  // seqeuentially or in parallel.  We currently assume that there is just one
  // stream.
  return socketStream$ => {
    const clientInput$ = socketStream$.pipe(share()); // subscribe only once
    const audioComplete$ = clientInput$.pipe(
      filter(e => [STT_STREAM_DONE, STT_STREAM_STOP].includes(e.type))
    );
    const audioChunk$ = clientInput$.pipe(
      takeUntil(audioComplete$),
      filter(e => e.type === NEXT_AUDIO_CHUNK),
      map(e => get(e, 'data.chunk'))
      // TODO: it should validate input data
      // mergeMap(buffer =>
      //   isBase64(buffer.toString('base64'))
      //   ? of(buffer)
      //   : throwError(errors.notBase64())
      // ),
    );
    return audioChunk$;
  };
};

module.exports = ingestAudioFromClient;
