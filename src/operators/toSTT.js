const get = require('lodash/get');
const {concat, merge, of} = require('rxjs');
const {
  delay,
  filter,
  map,
  mapTo,
  scan,
  tap
} = require('rxjs/operators');
const randomstring = require('randomstring');

const {conduit} = require('@buccaneerai/rxjs-socketio');
const trace = require('./trace');

const makeStreamId = () => randomstring.generate(7)

const mapResponseToWord = () => response => get(response, 'message', null);

const toSTT = ({
  token,
  streamId,
  runId,
  audioFileId,
  inputType,
  sttEngines,
  ensemblers,
  ensemblerOptions,
  saveRawSTT,
  saveWords,
  audioCheckpoint = null,
  stop$ = of(),
  _conduit = conduit,
  _makeStreamId = makeStreamId,
  delayTime = 2000,
  url = process.env.STT_WEBSOCKET_URL,
}) => linear16Chunk$ => {
  const _streamId = streamId || _makeStreamId();
  const streamConfig = {
    streamId: _streamId,
    audioFileId,
    inputType,
    runId,
    sttEngines,
    ensemblers,
    ensemblerOptions,
    saveRawSTT,
    saveWords,
  };
  let chunkIndexEnd = 0;
  let end = 0;
  if (audioCheckpoint) {
    if (audioCheckpoint.chunkIndexEnd > -1) {
      chunkIndexEnd = audioCheckpoint.chunkIndexEnd; // eslint-disable-line
    }
    if (audioCheckpoint.end > -1) {
      end = audioCheckpoint.end; // eslint-disable-line
    }
  }
  const conduitOptions = {
    url,
    socketOptions: {
      auth: {token},
      transports: ['websocket'],
    },
  };
  const firstMessage$ = of({...streamConfig, topic: 'new-stt-stream'}).pipe(
    delay(delayTime)
  );
  const fileChunkMessage$ = (
    inputType === 'audioStream'
    || inputType === 'telephoneCall'
    || inputType === 's3File'
    ? linear16Chunk$.pipe(
      scan((acc, next) => [next, acc[1] + 1], [null, -1]),
      map(([chunk, i]) => {
        // Send the audioCheckpoint's last end time and index
        return {topic: 'next-stt-chunk', index: i + chunkIndexEnd, end, binary: chunk};
      })
    )
    : of()
  );
  const stopMessage$ = stop$.pipe(mapTo({topic: 'stop', streamId: _streamId}));
  const lastMessage$ = of({topic: 'stt-stream-complete', streamId: _streamId});
  const message$ = concat(
    firstMessage$,
    merge(fileChunkMessage$, stopMessage$),
    lastMessage$
  );
  const messageOut$ = message$.pipe(
    _conduit(conduitOptions)
  );
  const error$ = messageOut$.error$.pipe(
    trace(`conduit.error`),
    tap((err) => {
      console.error(err);
    }),
    filter(() => false)
  );
  const word$ = messageOut$.pipe(
    map(mapResponseToWord()),
    tap((arg) => {
      if (arg.sttEngine === 'aws-medical') {
        console.log(`Chunk endOffset=${end}`);
        console.log(`Word i=${arg.i} start=${arg.start} end=${arg.end}`);
      }
    }),
  );
  return merge(word$, error$);
};

module.exports = toSTT;
module.exports.testExports = {mapResponseToWord};
