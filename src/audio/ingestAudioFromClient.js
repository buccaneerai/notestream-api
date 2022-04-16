const get = require('lodash/get');
// const {concat,of} = require('rxjs');
const {filter,map,share,takeUntil} = require('rxjs/operators');

const {
  NEXT_AUDIO_CHUNK,
  STT_STREAM_DONE,
  STT_STREAM_STOP,
  // NEW_STT_STREAM
} = require('../ws/producer');

const ingestAudioFromClient = () => {
  // note that in theory, a websocket could broadcast multiple audio streams, either
  // seqeuentially or in parallel.  This function creates a new audio stream
  // observable for each separate audio stream (usually a patient visit)
  return socketStream$ => {
    // multicast to avoid re-subscribing
    const clientInput$ = socketStream$.pipe(share());
    const audioComplete$ = clientInput$.pipe(
      filter(e => [STT_STREAM_DONE, STT_STREAM_STOP].includes(e.type))
    );
    const audioChunk$ = clientInput$.pipe(
      takeUntil(audioComplete$),
      filter(e => e.type === NEXT_AUDIO_CHUNK),
      map(e => get(e, 'data.chunk'))
    );
    return audioChunk$;
    // whenever a new audio stream is created, create a new observable
    // containing all of the events for that stream
    // const audioStream$$ = clientInput$.pipe(
    //   filter(e => e.type === NEW_STT_STREAM),
    //   map(e => {
    //     const {streamId} = e.data;
    //     const audioStream$ = concat(
    //       of(e),
    //       audioChunk$.pipe(
    //         filter(({data}) => data.streamId === streamId)
    //       ),
    //       audioComplete$.pipe(
    //         filter(({data}) => data.streamId === streamId)
    //       )
    //     );
    //     return audioStream$;
    //   })
    // );
    // return audioStream$$;
  };
};

module.exports = ingestAudioFromClient;
