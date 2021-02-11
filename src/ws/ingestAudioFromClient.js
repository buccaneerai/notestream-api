import {concat,of} from 'rxjs';
import {filter,map,share} from 'rxjs/operators';

import {NEXT_AUDIO_CHUNK,STT_STREAM_DONE,NEW_STT_STREAM} from './producer';

const ingestAudioFromClient = () => {
  // in theory, a websocket can broadcast multiple audio streams, either
  // seqeuentially or in parallel.  This function creates a new audio stream
  // observable for each separate audio stream (usually a patient visit)
  return socketStream$ => {
    // multicast to avoid re-subscribing
    const clientInput$ = socketStream$.pipe(share());
    const audioChunk$ = clientInput$.pipe(
      filter(e => e.type === NEXT_AUDIO_CHUNK),
      map(e => e.data.chunk)
    );
    const audioComplete$ = clientInput$.pipe(
      filter(e => e.type === STT_STREAM_DONE)
    );
    // whenever a new audio stream is created, create a new observable
    // containing all of the events for that stream
    const audioStream$$ = clientInput$.pipe(
      filter(e => e.type === NEW_STT_STREAM),
      map(e => {
        const {streamId} = e.data;
        const audioStream$ = concat(
          of(e),
          audioChunk$.pipe(
            filter(({data}) => data.streamId === streamId)
          ),
          audioComplete$.pipe(
            filter(({data}) => data.streamId === streamId)
          )
        );
        return audioStream$;
      })
    );
    return audioStream$$;
  };
};

export default ingestAudioFromClient;
