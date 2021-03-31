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
  tap
} = require('rxjs/operators');

const { DISCONNECTION } = require('./producer');
const getStreamConfig = require('./getStreamConfig');
const createAudioStream = require('./createAudioStream');
const {fileChunkToSTT} = require('../stt');
const nlp = require('../operators/nlp');
const trace = require('../operators/trace');
const predictElements = require('../operators/predictElements');
const createWindows = require('../operators/createWindows');
const storeRawAudio = require('../storage/storeRawAudio');
const storeWords = require('../storage/storeWords');

const consumeOneClientStream = function consumeOneClientStream(
  _createAudioStream = createAudioStream,
  _stt = fileChunkToSTT,
  _nlp = nlp,
  _getStreamConfig = getStreamConfig,
  _predictElements = predictElements,
  _storeRawAudio = storeRawAudio,
  _storeWords = storeWords,
  _createWindows = createWindows
) {
  return connectionStream$ => {
    const clientStreamSub$ = connectionStream$.pipe(shareReplay(5));
    const disconnect$ = clientStreamSub$.pipe(
      filter(e => e.type === DISCONNECTION),
      trace('ws.DISCONNECTION')
    );
    const socket$ = clientStreamSub$.pipe(
      filter(e => e.data.context && e.data.context.socket),
      map(e => e.data.context.socket),
      shareReplay(1)
    );
    const config$ = clientStreamSub$.pipe(
      _getStreamConfig(),
      shareReplay(1)
    );
    const stt$ = config$.pipe(
      take(1),
      mergeMap(config =>
        clientStreamSub$.pipe(
          _createAudioStream(config),
          (
            config.saveRawAudio
            ? _storeRawAudio(pick(config, 'runId', 'audioFileId'))
            : tap(null)
          ),
          _stt(pick(config, 'runId', 'sttEngines', 'saveRawSTT', 'saveWords')),
          config.saveWords ? _storeWords({runId: config.runId}) : tap(null),
        )
      ),
      map(event => ({ ...event, pipeline: 'stt' })),
      share()
    );
    const noteWindow$ = config$.pipe(
      take(1),
      mergeMap(config => stt$.pipe(_createWindows(config))),
      filter(words => !words),
      share()
    );
    const nlp$ = combineLatest([config$, stt$]).pipe(
      filter(([config, sttEvent]) => sttEvent.sttEngine === config.preferredSttEngine),
      map(([, word]) => word),
      _nlp(),
      map(event => ({ ...event, pipeline: 'nlp' })),
      share()
    );
    const predictedElement$ = nlp$.pipe(
      _predictElements(),
      map(event => ({ ...event, pipeline: 'predictedElement' }))
    );
    const output$ = merge(stt$, noteWindow$, nlp$, predictedElement$);
    const messageBack$ = combineLatest([socket$, output$]).pipe(
      takeUntil(disconnect$),
      map(([socket, event]) => socket.emit('message', event))
      // map(([socket, event]) => socket.emit('stt-output', event))
    );
    return messageBack$;
  };
};

module.exports = consumeOneClientStream;
