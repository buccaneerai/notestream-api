const get = require('lodash/get');
const {concat, merge, of} = require('rxjs');
const {
  delay,
  map,
  mapTo,
  scan
} = require('rxjs/operators');
const randomstring = require('randomstring');

const {conduit} = require('@buccaneerai/rxjs-socketio');
// const trace = require('./trace');

const makeStreamId = () => randomstring.generate(7)

const mapResponseToWord = () => response => get(response, 'message', null);

const toSTT = ({
  streamId,
  runId,
  audioFileId,
  inputType,
  sttEngines,
  ensemblers,
  ensemblerOptions,
  saveRawSTT,
  saveWords,
  stop$ = of(),
  _conduit = conduit,
  _makeStreamId = makeStreamId,
  delayTime = 2000,
  url = process.env.STT_WEBSOCKET_URL,
  token = process.env.JWT_TOKEN,
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
  const conduitOptions = {
    url,
    socketOptions: {
      auth: {token},
      transports: ['websocket'],
    },
  };
  const firstMessage$ = of({
    ...streamConfig,
    topic: 'new-stt-stream',
  }).pipe(
    delay(delayTime)
  );
  const fileChunkMessage$ = linear16Chunk$.pipe(
    scan((acc, next) => [next, acc[1] + 1], [null, -1]),
    map(([chunk, i]) => ({topic: 'next-stt-chunk', index: i, binary: chunk}))
  );
  const stopMessage$ = stop$.pipe(mapTo({topic: 'stop', streamId: _streamId}));
  const lastMessage$ = of({topic: 'stt-stream-complete', streamId: _streamId});
  const message$ = concat(
    firstMessage$,
    merge(fileChunkMessage$, stopMessage$),
    lastMessage$
  );
  const messageOut$ = message$.pipe(_conduit(conduitOptions));
  const word$ = messageOut$.pipe(map(mapResponseToWord()));
  return word$;
};

module.exports = toSTT;
module.exports.testExports = {mapResponseToWord};
