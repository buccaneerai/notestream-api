import {expect} from 'chai';
import {of} from 'rxjs';

import createConsumer from './createConsumer';

describe('createConsumer', () => {
  it('should export a function', () => {
    expect(createConsumer).to.be.a('function');
  });

  it('should return an Observable', () => {
    const params = {
      io: {foo: 'bar'},
      _fromSocketIO: () => of('hello'),
      _consumeOneClientStream: () => obs$ => obs$,
    };
    const output = createConsumer(params);
    expect(output.subscribe).to.be.a('function');
  });
});
