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
} = require('rxjs/operators');

const { DISCONNECTION, STT_STREAM_STOP } = require('./producer');
const getStreamConfig = require('./getStreamConfig');
const createAudioStream = require('./createAudioStream');
const toSTT = require('../operators/toSTT');
// const nlp = require('../operators/nlp');
const trace = require('../operators/trace');
// const predictElements = require('../operators/predictElements');
const createWindows = require('../operators/createWindows');
const storeRawAudio = require('../storage/storeRawAudio');
// const storeWords = require('../storage/storeWords');
// const createPredictions = require('../storage/createPredictions');

const consumeOneClientStream = function consumeOneClientStream(
  _createAudioStream = createAudioStream,
  _toSTT = toSTT,
  _getStreamConfig = getStreamConfig,
  // _predictElements = predictElements,
  _storeRawAudio = storeRawAudio,
  // _storeNlp = storeNlp,
  // _createPredictions = createPredictions,
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
    const end$ = merge(disconnect$, stop$).pipe(share());
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
          _toSTT({
            stop$: end$,
            ...pick(
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
            )
          })
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
        // const nlp$ = of(...words).pipe(
        //   _nlp(),
        //   map(event => ({...event, pipeline: 'nlp'})),
        //   share()
        // );
        // const saveNlp$ = nlp$.pipe(
        //   toArray(),
        //   mergeMap(nlpEvents => _storeAllNlp())
        // );
        // const predictedElement = nlp$.pipe(
        //   // FIXME: this must return {findingCode, strategy, confidence}
        //   _predictElements(config, 'runId'),
        //   _createPredictions(),
        //   map(event => ({ ...event, pipeline: 'predictedElement' }))
        // );
        // return merge(stt$, nlp$, predictedElement$);
        return stt$;
      })
    );
    const messageBack$ = combineLatest([socket$, output$]).pipe(
      takeUntil(end$),
      map(([socket, event]) => socket.emit('message', event))
    );
    return messageBack$;
  };
};

module.exports = consumeOneClientStream;
