import { map, mergeAll } from 'rxjs/operators';

import { fromSocketIO } from './producer';
import consumeOneClientStream from './consumeOneClientStream';
import trace from '../operators/trace';

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

export default createConsumer;
