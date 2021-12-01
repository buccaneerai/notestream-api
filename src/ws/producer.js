const { Observable } = require('rxjs');
const { map } = require('rxjs/operators');
const toPairs = require('lodash/toPairs');
const logError = require('../utils/logger').error;

// const MESSAGE = 'ws/MESSAGE');
const NEW_STT_STREAM = 'ws/NEW_STT_STREAM';
const NEXT_AUDIO_CHUNK = 'ws/NEXT_AUDIO_CHUNK';
const STT_STREAM_DONE = 'ws/STT_STREAM_DONE';
const STT_STREAM_STOP = 'ws/STT_STREAM_STOP';
const CONNECTION = 'ws/CONNECTION';
const DISCONNECTION = 'ws/DISCONNECTION';
const DISCONNECTING = 'ws/DISCONNECTING';
const VOLATILE = 'ws/VOLATILE';

const eventResolvers = {
  disconnecting: (context, obs) => obs.next({ type: DISCONNECTING, data: { context } }),
  disconnect: (context, obs, reason) => {
    obs.next({ type: DISCONNECTION, data: { reason, context } });
    return obs.complete();
  },
  stop: (context, obs) => obs.next({type: STT_STREAM_STOP, data: { context }}),
  'new-stream': (context, obs, json) =>
    obs.next({ type: NEW_STT_STREAM, data: { ...json, context } }),
  'next-chunk': (context, obs, [json, chunk]) =>
    obs.next({ type: NEXT_AUDIO_CHUNK, data: { chunk, data: json, context } }),
  complete: (context, obs, json) =>
    obs.next({ type: STT_STREAM_DONE, data: { ...json, context } }),
  volatile: (context, obs) => obs.next({ type: VOLATILE, data: { context } }),
  error: (context, obs, err) => obs.error(err),
};

// converts a socket.io connection event stream into an Observable
const mapConnectionToEvents = socket => {
  const clientEvent$ = new Observable(obs => {
    const context = { socket, user: socket.user };
    obs.next({ type: CONNECTION, data: { context } });
    toPairs(eventResolvers).forEach(([eventName, resolver]) =>
      socket.on(eventName, data => resolver(context, obs, data))
    );
  });
  return clientEvent$;
};

const fromSocketIO = ({ io }) => {
  const clientConnectionSocket$ = new Observable(obs => {
    io.on('connection', socket => obs.next(socket));
    io.on('error', err => logError('Error in producer socket', err));
  });
  const connectionStream$$ = clientConnectionSocket$.pipe(
    map(mapConnectionToEvents)
  );
  return connectionStream$$;
};

module.exports.mapConnectionToEvents = mapConnectionToEvents;
module.exports.fromSocketIO = fromSocketIO;
module.exports.NEW_STT_STREAM = NEW_STT_STREAM;
module.exports.NEXT_AUDIO_CHUNK = NEXT_AUDIO_CHUNK;
module.exports.STT_STREAM_DONE = STT_STREAM_DONE;
module.exports.STT_STREAM_STOP = STT_STREAM_STOP;
module.exports.CONNECTION = CONNECTION;
module.exports.DISCONNECTION = DISCONNECTION;
module.exports.DISCONNECTING = DISCONNECTING;
module.exports.VOLATILE = VOLATILE;
