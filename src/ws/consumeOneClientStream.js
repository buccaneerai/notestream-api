const get = require('lodash/get');
const pick = require('lodash/pick');
const { combineLatest, merge } = require('rxjs');
const {
  filter,
  map,
  mergeMap,
  share,
  shareReplay,
  take,
  takeUntil,
  withLatestFrom
} = require('rxjs/operators');

const { DISCONNECTION, STT_STREAM_STOP } = require('./producer');
const getStreamConfig = require('./getStreamConfig');
const createAudioStream = require('../audio/createAudioStream');
const toSTT = require('../operators/toSTT');
const trace = require('../operators/trace');
const createWindows = require('../operators/createWindows');
// const storeRawAudio = require('../storage/storeRawAudio');

const getSttConfig = config => pick(
  config,
  'streamId',
  'audioFileId',
  'inputType',
  'runId',
  'sttEngines',
  'ensemblers',
  'ensemblerOptions',
  'saveRawSTT',
  'saveWords'
);

const consumeOneClientStream = function consumeOneClientStream(
  _createAudioStream = createAudioStream,
  _toSTT = toSTT,
  _getStreamConfig = getStreamConfig,
  // _predictElements = predictElements,
  // _storeRawAudio = storeRawAudio,
  // _storeNlp = storeNlp,
  // _createPredictions = createPredictions,
  _createWindows = createWindows
) {
  return connectionStream$ => {
    const clientStreamSub$ = connectionStream$.pipe(shareReplay(5));
    const disconnect$ = clientStreamSub$.pipe(
      filter(e => e.type === DISCONNECTION)
    );
    const stop$ = clientStreamSub$.pipe(
      filter(e => e.type === STT_STREAM_STOP)
    );
    const end$ = merge(disconnect$, stop$).pipe(share());
    const socket$ = clientStreamSub$.pipe(
      filter(e => e.data.context && e.data.context.socket),
      map(e => e.data.context.socket),
      shareReplay(1)
    );
    const config$ = clientStreamSub$.pipe(
      _getStreamConfig(),
      take(1),
      shareReplay(1)
    );
    const stt$ = config$.pipe(
      trace('ws.START_STREAM'),
      withLatestFrom(socket$),
      map(([config, socket]) => [config, get(socket, 'handshake.auth.token')]),
      mergeMap(([config, token]) =>
        clientStreamSub$.pipe(
          _createAudioStream(config),
          // FIXME - should store audio
          // (
          //   config.inputType === 'audioStream' && config.saveRawAudio
          //   ? _storeRawAudio(pick(config, 'runId', 'audioFileId'))
          //   : tap(null)
          // ),
          _toSTT({
            token,
            stop$: end$,
            ...getSttConfig(config)
          })
        )
      ),
      map(event => ({ ...event, pipeline: 'stt' })),
      share()
    );
    const noteWindow$ = config$.pipe(
      mergeMap(config => stt$.pipe(_createWindows(config))),
      filter(words => !words),
      share()
    );
    // const output$ = combineLatest([config$, noteWindow$]).pipe(
    //   map(([,noteWindow]) => stt$),
    //   trace('consumeOneClientStream.out')
    // );
    const runId$ = config$.pipe(
      map(conf => ({runId: conf.runId, pipeline: 'runCreated'}))
    );
    const output$ = config$.pipe(
      mergeMap(config => merge(
        runId$,
        noteWindow$,
        stt$.pipe(filter(() => config.sendSTTOutput))
      )),
    );
    const messageBack$ = combineLatest([socket$, output$]).pipe(
      takeUntil(end$),
      map(([socket, event]) => socket.emit('message', event))
    );
    return messageBack$;
  };
};

module.exports = consumeOneClientStream;
