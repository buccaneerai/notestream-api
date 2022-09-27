const omit = require('lodash/omit');
const { map, mergeAll, tap } = require('rxjs/operators');

const { fromSocketIO, NEXT_AUDIO_CHUNK } = require('./producer');
const consumeOneClientStream = require('./consumeOneClientStream');
const logger = require('../utils/logger');

const createConsumer = ({
  io,
  _fromSocketIO = fromSocketIO,
  _consumeOneClientStream = consumeOneClientStream,
}) => {
  const clientStream$$ = _fromSocketIO({ io });
  const outputStream$$ = clientStream$$.pipe(
    map(input$ => input$.pipe(
      tap(e =>
        e.type !== NEXT_AUDIO_CHUNK
        ? logger.info('WS_PRODUCED', omit(e, 'context', 'data.context', 'data.chunk'))
        : null
      ),
    )),
    map(clientStream$ => clientStream$.pipe(_consumeOneClientStream()))
  );
  const consumer$ = outputStream$$.pipe(mergeAll());
  return consumer$;
};

module.exports = createConsumer;
