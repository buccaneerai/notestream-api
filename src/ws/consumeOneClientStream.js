const get = require('lodash/get');
const pick = require('lodash/pick');
const { of, combineLatest, merge, BehaviorSubject } = require('rxjs');
const {
  filter,
  map,
  mergeMap,
  share,
  shareReplay,
  take,
  takeLast,
  takeUntil,
  tap,
  withLatestFrom,
} = require('rxjs/operators');

const {
  DISCONNECTION,
  STT_STREAM_COMPLETE,
  STT_STREAM_STOP
} = require('./producer');
const getStreamConfig = require('./getStreamConfig');
const createAudioStream = require('../audio/createAudioStream');
const toSTT = require('../operators/toSTT');
const trace = require('../operators/trace');
const logAudioStreamProgress = require('../operators/logAudioStreamProgress');
const createWindows = require('../operators/createWindows');
const storeStatusUpdates = require('../storage/storeStatusUpdates');
const updateRun = require('../storage/updateRun');
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

const consumeOneClientStream = function consumeOneClientStream({
  _createAudioStream = createAudioStream,
  _toSTT = toSTT,
  _getStreamConfig = getStreamConfig,
  // _storeRawAudio = storeRawAudio,
  _createWindows = createWindows,
  _storeStatusUpdates = storeStatusUpdates,
  _updateRun = updateRun,
  returnOutputData = false,
} = {}) {
  return connectionStream$ => {
    const lastAudioLog$ = new BehaviorSubject(null);
    const clientStreamSub$ = connectionStream$.pipe(shareReplay(5));
    const disconnect$ = clientStreamSub$.pipe(
      filter(e => e.type === DISCONNECTION),
      map((e) => {
        const log = lastAudioLog$.getValue();
        return {
          ...e,
          log
        };
      }),
    );
    const stop$ = clientStreamSub$.pipe(
      filter(e => e.type === STT_STREAM_STOP),
      map((e) => {
        const log = lastAudioLog$.getValue();
        return {
          ...e,
          log
        };
      }),
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
      tap((config) => {
        if (config.isResume) {
          return trace('ws.RESUME_STREAM');
        }
        return trace('ws.START_STREAM');
      }),
      shareReplay(1)
    );
    const stt$ = config$.pipe(
      withLatestFrom(socket$),
      map(([config, socket]) => [config, get(socket, 'handshake.auth.token')]),
      mergeMap(([config, token]) => {
        return clientStreamSub$.pipe(
          _createAudioStream(config),
          // Note: Audio is saved to s3 in logAudioSTreamProgress
          logAudioStreamProgress({config}),
          tap((message) => {
            if (message.type && message.type === 'log') {
              lastAudioLog$.next(message);
            }
          }),
          mergeMap((message) => {
            if (message.type && message.type === 'log') {
              return _updateRun({runId: message.runId})({audioCheckpoint: message});
            }
            return of();
          }),
          _toSTT({
            token,
            stop$: end$,
            ...getSttConfig(config)
          }),
        );
      }),
      map(event => ({ ...event, pipeline: 'stt' })),
      takeUntil(end$),
      share()
    );
    const complete$ = stt$.pipe(
      takeLast(1),
      map(() => {
        const log = lastAudioLog$.getValue();
        return {type: STT_STREAM_COMPLETE, log};
      }),
      share()
    );
    const noteWindow$ = config$.pipe(
      mergeMap(config => stt$.pipe(_createWindows(config))),
      filter(words => !words),
      share()
    );
    const runId$ = config$.pipe(
      map(conf => ({runId: conf.runId, pipeline: 'runCreated'})),
      take(1)
    );
    // track the status of the run on the MongoDB object
    const statusUpdate$ = _storeStatusUpdates({config$, end$, complete$}).pipe(
      filter(() => false) // we don't actually need to return the data
    );
    const output$ = config$.pipe(
      take(1),
      mergeMap(config => merge(
        runId$,
        noteWindow$,
        stt$.pipe(filter(() => config.sendSTTOutput)),
        statusUpdate$
      )),
    );
    const messageBack$ = combineLatest([
      socket$.pipe(take(1)),
      output$
    ]).pipe(
      // takeUntil(end$),
      tap(([socket, event]) => socket.emit('message', event)),
      map(([,event]) => event),
      filter(() => returnOutputData)
    );
    return messageBack$;
  };
};

module.exports = consumeOneClientStream;
