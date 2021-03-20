const { map, mergeAll } = require('rxjs/operators');

const { fromSocketIO } = require('./producer');
const consumeOneClientStream = require('./consumeOneClientStream');
const trace = require('../operators/trace');

const createConsumer = ({
  io,
  _fromSocketIO = fromSocketIO,
  _consumeOneClientStream = consumeOneClientStream,
}) => {
  const clientStream$$ = _fromSocketIO({ io });
  const outputStream$$ = clientStream$$.pipe(
    map(input$ => input$.pipe(trace('PRODUCED'))),
    map(clientStream$ => clientStream$.pipe(_consumeOneClientStream()))
  );
  const consumer$ = outputStream$$.pipe(mergeAll());
  return consumer$;
};

module.exports = createConsumer;
