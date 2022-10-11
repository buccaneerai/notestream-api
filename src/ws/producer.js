const { Observable } = require('rxjs');
const { map } = require('rxjs/operators');
const get = require('lodash/get');
const toPairs = require('lodash/toPairs');

const logError = require('../utils/logger').error;

// const MESSAGE = 'ws/MESSAGE');
const NEW_STT_STREAM = 'ws/NEW_STT_STREAM';
const NEXT_AUDIO_CHUNK = 'ws/NEXT_AUDIO_CHUNK';
const STT_STREAM_DONE = 'ws/STT_STREAM_DONE';
const STT_STREAM_STOP = 'ws/STT_STREAM_STOP';
const STT_STREAM_COMPLETE = 'stt/STT_STREAM_COMPLETE';
const CONNECTION = 'ws/CONNECTION';
const DISCONNECTION = 'ws/DISCONNECTION';
const DISCONNECTING = 'ws/DISCONNECTING';
const VOLATILE = 'ws/VOLATILE';

const eventResolvers = ({namespace} = {}) => {
  const dict = {
    // SocketIO events
    disconnecting: (context, obs) => obs.next({
      type: DISCONNECTING,
      data: { context }
    }),
    disconnect: (context, obs, reason) => {
      obs.next({ type: DISCONNECTION, data: { reason, context } });
      return obs.complete();
    },
    volatile: (context, obs) => obs.next({ type: VOLATILE, data: { context } }),
    error: (context, obs, err) => obs.error(err),
    // messages
    'new-stt-stream': (context, obs, json) => obs.next({
      type: NEW_STT_STREAM,
      data: { ...json, context }
    }),
    'new-stream': (context, obs, json) => obs.next({
      type: NEW_STT_STREAM, data: { ...json, context }
    }),
    // Events containing chunks of audio binary
    'next-stt-chunk': (context, obs, json, binary) => obs.next({
      type: NEXT_AUDIO_CHUNK,
      data: { ...json, chunk: binary, context },
    }),
    'next-chunk': (context, obs, json, binary) => obs.next({
      type: NEXT_AUDIO_CHUNK,
      data: { ...json, chunk: binary, context },
    }),
    'stt-stream-complete': (context, obs, json) => obs.next({
      type: STT_STREAM_DONE,
      data: { ...json, context }
    }),
    stop: (context, obs) => obs.next({
      type: STT_STREAM_STOP,
      data: { context }
    }),
    complete: (context, obs, json) => obs.next({
      type: STT_STREAM_DONE,
      data: { ...json, context }
    }),
  };
  const namespacedDict = (
    namespace
    ? toPairs(dict).reduce((acc, [k, v]) => ({
      ...acc,
      [`${namespace.replace(/^\//, '')}:${k}`]: v,
    }), {})
    : dict
  );
  return namespacedDict;
};

// converts a socket.io connection event stream into an Observable
const mapConnectionToEvents = ({namespace}) => socket => {
  const clientEvent$ = new Observable(obs => {
    const context = { socket, user: socket.user };
    obs.next({ type: CONNECTION, data: { context } });
    toPairs(eventResolvers({namespace})).forEach(([eventName, resolver]) =>
      socket.on(eventName, (data, binary) => resolver(context, obs, data, binary))
    );
  });
  return clientEvent$;
};

const fromSocketIO = ({
  io,
  namespace = process.env.NAMESPACE || '/notestream',
  _mapConnectionToEvents = mapConnectionToEvents
}) => {
  const clientConnectionSocket$ = new Observable(obs => {
    const namespaceIO = io.of(namespace);
    namespaceIO.on('connection', socket => obs.next(socket));
    namespaceIO.on('error', err => logError('Error in producer socket', err));
  });
  const connectionStream$$ = clientConnectionSocket$.pipe(
    map(_mapConnectionToEvents({namespace}))
  );
  return connectionStream$$;
};

module.exports.mapConnectionToEvents = mapConnectionToEvents;
module.exports.fromSocketIO = fromSocketIO;
module.exports.eventResolvers = eventResolvers;
module.exports.NEW_STT_STREAM = NEW_STT_STREAM;
module.exports.NEXT_AUDIO_CHUNK = NEXT_AUDIO_CHUNK;
module.exports.STT_STREAM_DONE = STT_STREAM_DONE;
module.exports.STT_STREAM_STOP = STT_STREAM_STOP;
module.exports.STT_STREAM_COMPLETE = STT_STREAM_COMPLETE;
module.exports.CONNECTION = CONNECTION;
module.exports.DISCONNECTION = DISCONNECTION;
module.exports.DISCONNECTING = DISCONNECTING;
module.exports.VOLATILE = VOLATILE;
