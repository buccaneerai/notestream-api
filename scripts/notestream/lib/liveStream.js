const pick = require('lodash/pick');
const randomstring = require('randomstring');
const {BehaviorSubject,merge,of,timer} = require('rxjs');
const {
  delay,
  map,
  mapTo,
  mergeMap,
  scan,
  skip,
  take,
  tap,
  toArray
} = require('rxjs/operators');

const {conduit} = require('@buccaneerai/rxjs-socketio');
const {fromFile,shortenChunks} = require('@buccaneerai/rxjs-fs');

const mapChunkWithIndexToAudioMessage = streamId => ([chunk, i]) => ({
  streamId,
  topic: 'next-chunk',
  index: i,
  binary: chunk,
});

const liveStream = ({
  initialDelay = 3000,
  // 1 second of LINEAR16 audio is 32bit*16000Hz/8bitsperbyte = 64000 bytes
  bytesPerChunk = 64000,
  _conduit = conduit
} = {}) => opts => {
  const streamId = randomstring.generate(7);
  const stop$ = opts.take ? timer(opts.take * 1000) : of();
  const firstMessage = {
    streamId,
    topic: 'new-stream',
    ...pick(
      opts,
      'inputType',
      'sttEngines',
      'ensemblers',
      'ensemblerOptions',
      'saveRawSTT',
      'saveWords',
      'saveWindows',
    )
  };
  const firstMessage$ = of(firstMessage).pipe(delay(1000));
  const audioMessage$ = fromFile({filePath: opts.inputFilePath}).pipe(
    delay(initialDelay),
    shortenChunks(bytesPerChunk),
    opts.skip ? skip(opts.skip) : tap(null),
    opts.take ? take(opts.take) : tap(null),
    scan((acc, next) => [next, acc[1] + 1], [null, -1]),
    mergeMap(([chunk, i]) => of([chunk, i]).pipe(delay(i * 1000))),
    map(mapChunkWithIndexToAudioMessage(streamId))
  );
  const stopSignal$ = new BehaviorSubject();
  const stopMessage$ = stopSignal$.pipe(mapTo({streamId, topic: 'stop'}));
  const completeMessage$ = of({topic: 'complete', streamId});
  const message$ = merge(
    firstMessage$,
    merge(audioMessage$, stopMessage$),
    completeMessage$
  );
  const eventFromServer$ = message$.pipe(
    // tap(m => console.log('WS.messageIn', m)),
    _conduit({
      url: opts.url,
      stop$,
      // topics: ['stt-output', 'nlp', 'predictedElement', 'stream-complete'],
      socketOptions: {
        transports: ['websocket'],
        auth: {token: opts.token},
      },
    }),
  );
  process.on('exit', () => {
    stopSignal$.next(true);
    console.log('🛑 Stopping stream gracefully...');
    return setInterval(2000, () => console.log('✅ Done'));
  });
  return eventFromServer$;
};

module.exports = liveStream;
