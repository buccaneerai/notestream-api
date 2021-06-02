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
  tap,
  toArray
} = require('rxjs/operators');

const { DISCONNECTION, STT_STREAM_STOP } = require('./producer');
const getStreamConfig = require('./getStreamConfig');
const createAudioStream = require('./createAudioStream');
const {fileChunkToSTT} = require('../stt');
const nlp = require('../operators/nlp');
const trace = require('../operators/trace');
const predictElements = require('../operators/predictElements');
const createWindows = require('../operators/createWindows');
const storeRawAudio = require('../storage/storeRawAudio');
const storeWords = require('../storage/storeWords');
const storeAllNlp = require('../storage/storeAllNlp');
const createPredictions = require('../storage/createPredictions');

const consumeOneClientStream = function consumeOneClientStream(
  _createAudioStream = createAudioStream,
  _stt = fileChunkToSTT,
  _nlp = nlp,
  _getStreamConfig = getStreamConfig,
  _predictElements = predictElements,
  _storeRawAudio = storeRawAudio,
  _storeWords = storeWords,
  _storeNlp = storeNlp,
  _createPredictions = createPredictions,
  _createWindows = createWindows
) {
  return connectionStream$ => {
    const clientStreamSub$ = connectionStream$.pipe(shareReplay(5));
    const disconnect$ = clientStreamSub$.pipe(
      filter(e => e.type === DISCONNECTION),
      trace('ws.DISCONNECTION')
    );
    const stop$ = clientStreamSub$.pipe(
      filter(e => e.type === STT_STREAM_STOP)
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
    const output$ = combineLatest([config$, noteWindow$]).pipe(
      mergeMap(([config, [words, noteWindowId]]) => {
        const nlp$ = of(...words).pipe(
          _nlp(),
          map(event => ({...event, pipeline: 'nlp'})),
          share()
        );
        const saveNlp$ = nlp$.pipe(
          toArray(),
          mergeMap(nlpEvents => _storeAllNlp())
        );
        const predictedElement = nlp$.pipe(
          // FIXME: this must return {findingCode, strategy, confidence}
          _predictElements(config, 'runId'),
          _createPredictions(),
          map(event => ({ ...event, pipeline: 'predictedElement' }))
        );
        return merge(stt$, nlp$, predictedElement$);
      })
    );
    // const nlp$ = combineLatest([config$, stt$]).pipe(
    //   filter(([config, sttEvent]) => sttEvent.sttEngine === config.preferredSttEngine),
    //   map(([, word]) => word),
    //   _nlp(),
    //   map(event => ({ ...event, pipeline: 'nlp' })),
    //   share()
    // );
    // const predictedElement$ = nlp$.pipe(
    //   _predictElements(),
    //   map(event => ({ ...event, pipeline: 'predictedElement' }))
    // );
    // const output$ = merge(stt$, noteWindow$, nlp$, predictedElement$);
    const messageBack$ = combineLatest([socket$, output$]).pipe(
      takeUntil(merge(disconnect$, stop$)),
      map(([socket, event]) => socket.emit('message', event))
      // map(([socket, event]) => socket.emit('stt-output', event))
    );
    return messageBack$;
  };
};

module.exports = consumeOneClientStream;
