const get = require('lodash/get');
const {concat, merge, of} = require('rxjs');
const {
  delay,
  filter,
  map,
  mapTo
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
}) => fileChunk$ => {
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
  // FIXME: this currently does not stream audio to the STT api.  That
  // has yet to be implemented...
  const fileChunkMessage$ = fileChunk$.pipe(filter(() => false));
  // const fileChunkMessage$ = fileChunk$.pipe(
    // map(chunk => ({topic: 'next-stt-chunk', binary: chunk}))
    // FIXME: this is a hack to ensure the websocket opens before trying to
    // send messages
  // );
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
