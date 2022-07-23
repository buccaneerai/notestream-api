const randomstring = require('randomstring');
const {concat, of, timer} = require('rxjs');
const {
  delay,
  mapTo,
  mergeMap,
  scan,
  takeUntil
} = require('rxjs/operators');

const {conduit} = require('@buccaneerai/rxjs-socketio');

const testWebSocket = ({
  url,
  token,
  audioFileId,
  sttEngines,
  ensemblers,
  saveWords,
  saveRawSTT,
  saveWindows,
  delayTime = 500,
  take = null,
  _conduit = conduit
}) => {
  console.log('🚰 Sending messages to ', url);
  const streamId = randomstring.generate(7);
  const stop$ = take ? timer(take * 1000) : of();
  const conduitOptions = {
    stop$,
    url,
    socketOptions: {
      transports: ['websocket'],
      auth: {token},
    },
  };
  const firstMessage$ = of({
    topic: 'new-stream',
    streamId,
    audioFileId,
    inputType: 's3File',
    sttEngines,
    ensemblers,
    saveWords,
    saveRawSTT,
    saveWindows,
  }).pipe(delay(delayTime * 2));
  // const dataMessage$ = of();
  // const terminationMessage$ = of({topic: 'complete-stt-stream'});
  const messageIn$ = concat(firstMessage$).pipe(
    scan((acc, m) => [m, acc[1] + 1], [null, -1]),
    // delay transmission of the items
    mergeMap(([m, i]) =>
      timer(delayTime * (i + 1)).pipe(mapTo(m))
    )
  );
  const messageFromServer$ = messageIn$.pipe(
    // tap(w => console.log('SENDING_MESSAGE: ', w)),
    _conduit(conduitOptions),
    takeUntil(stop$)
  );
  messageFromServer$.subscribe(
    console.log,
    console.trace,
    console.log.bind(null, 'DONE')
  );
};

module.exports = testWebSocket;
