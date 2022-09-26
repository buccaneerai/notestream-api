const { filter, map, mergeAll } = require('rxjs/operators');

const { fromSocketIO, NEXT_AUDIO_CHUNK } = require('./producer');
const consumeOneClientStream = require('./consumeOneClientStream');
const trace = require('../operators/trace');

const createConsumer = ({
  io,
  _fromSocketIO = fromSocketIO,
  _consumeOneClientStream = consumeOneClientStream,
}) => {
  const clientStream$$ = _fromSocketIO({ io });
  const outputStream$$ = clientStream$$.pipe(
    map(input$ => input$.pipe(
      filter(e => e.type !== NEXT_AUDIO_CHUNK),
      trace('PRODUCED')
    )),
    map(clientStream$ => clientStream$.pipe(_consumeOneClientStream()))
  );
  const consumer$ = outputStream$$.pipe(mergeAll());
  return consumer$;
};

module.exports = createConsumer;
