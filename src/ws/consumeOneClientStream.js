const get = require('lodash/get');
// const set = require('lodash/set');
const pick = require('lodash/pick');
const { of, combineLatest, merge, BehaviorSubject, zip } = require('rxjs');
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
  // withLatestFrom,
} = require('rxjs/operators');

const logger = require('@buccaneerai/logging-utils');
const {client} = require('@buccaneerai/graphql-sdk');

const {
  DISCONNECTION,
  STT_STREAM_COMPLETE,
  STT_STREAM_STOP
} = require('./producer');
const getStreamConfig = require('./getStreamConfig');
const createAudioStream = require('../audio/createAudioStream');
const toSTT = require('../operators/toSTT');
// const trace = require('../operators/trace');
const logAudioStreamProgress = require('../operators/logAudioStreamProgress');
const createWindows = require('../operators/createWindows');
const storeStatusUpdates = require('../storage/storeStatusUpdates');
const updateRun = require('../storage/updateRun');
// const storeRawAudio = require('../storage/storeRawAudio');

const gql = (url = process.env.GRAPHQL_URL, token = process.env.JWT_TOKEN) => (
  client({url, token})
);

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
  'saveWords',
  'audioCheckpoint'
);

const consumeOneClientStream = function consumeOneClientStream({
  isSocketIOStream = true,
  _createAudioStream = createAudioStream,
  _toSTT = toSTT,
  _getStreamConfig = getStreamConfig,
  // _storeRawAudio = storeRawAudio,
  _createWindows = createWindows,
  _storeStatusUpdates = storeStatusUpdates,
  _updateRun = updateRun,
  _gql = gql(),
  _logger = logger,
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
    const end$ = merge(disconnect$, stop$).pipe(
      mergeMap((data) => {
        const runId = get(data, 'log.runId', null);
        if (!runId) {
          return of(data);
        }
        return _gql.findNoteWindows({filter: { runId }, queryOptions: { sortBy: 'timeCreated', sortDir: -1, limit: 1 }}).pipe(
          mergeMap((response) => {
            const { noteWindows = [] } = response;
            if (noteWindows.length) {
              const { _id: docId } = noteWindows[0];
              return _gql.updateNoteWindow({docId, set: {lastNoteWindow: true}}).pipe(
                map(() => {
                  return data;
                })
              );
            }
            return of(data);
          })
        );
      }),
      share(),
    );
    const socket$ = clientStreamSub$.pipe(
      filter(e => e.data.context && e.data.context.socket),
      map(e => e.data.context.socket),
      tap(() => _logger.info('consumeOneClientStream.socketEmitted', {})),
      shareReplay(1)
    );
    const config$ = clientStreamSub$.pipe(
      _getStreamConfig(),
      take(1),
      tap(config => _logger.info(
        config.isResume ? 'ws.RESUME_STREAM' : 'ws.START_STREAM',
        {config}
      )),
      shareReplay(1)
    );
    const stt$ = zip(config$, socket$).pipe(
      // withLatestFrom(socket$),
      map(([config, socket]) => [config, get(socket, 'handshake.auth.token')]),
      mergeMap(([config, token]) => {
        _logger.info('consumeOneClientStream.stt.start', {runId: config.runId});
        return clientStreamSub$.pipe(
          _createAudioStream({config}),
          // Note: Audio is saved to s3 in logAudioSTreamProgress
          logAudioStreamProgress({config}),
          tap((message) => {
            if (message.type && message.type === 'log') {
              lastAudioLog$.next(message);
            }
          }),
          mergeMap((message) => {
            if (message.type && message.type === 'log') {
              // Add the latest log message to the run as audioCheckpoint
              return _updateRun({runId: message.runId})({audioCheckpoint: message});
            }
            return of(message);
          }),
          filter((message) => !message.type && !message.updateRun),
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
      mergeMap((data) => {
        const runId = get(data, 'log.runId', null);
        if (!runId) {
          return of(data);
        }
        return _gql().findNoteWindows({filter: { runId }, queryOptions: { sortBy: 'timeCreated', sortDir: -1, limit: 1 }}).pipe(
          mergeMap((response) => {
            const { noteWindows = [] } = response;
            if (noteWindows.length) {
              const { _id: docId } = noteWindows[0];
              return _gql.updateNoteWindow({docId, set: {lastNoteWindow: true}}).pipe(
                map(() => {
                  const log = lastAudioLog$.getValue();
                  return {type: STT_STREAM_COMPLETE, log};
                })
              );
            }
            const log = lastAudioLog$.getValue();
            return of({type: STT_STREAM_COMPLETE, log});
          })
        );
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
      tap(([socket, event]) =>
        isSocketIOStream
        ? socket.emit('message', event)
        : null
      ),
      map(([,event]) => event),
      filter(() => returnOutputData)
    );
    return messageBack$;
  };
};

module.exports = consumeOneClientStream;
