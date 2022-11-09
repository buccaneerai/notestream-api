const {expect} = require('chai');
const {of} = require('rxjs');
const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');

const createConsumer = require('./createConsumer');

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

  it('should run workflows properly and catch errors given correct input data', marbles(m => {
    const client0$ = m.cold('-0-#', [{'foo': 'bar0'}], new Error('doh'));
    const client1$ = m.cold('----0--(1|)', [
      {'foo': 'bar1'},
      {'foo': 'bar2'},
    ]);
    const params = {
      io: {foo: 'bar'},
      _fromSocketIO: sinon.stub().returns(
        m.cold('--0-(1|)', [client0$, client1$])
      ),
      _consumeOneClientStream: sinon.stub().returns(source$ => source$),
      _logger: {error: sinon.spy(), info: sinon.spy()},
    };
    const actual$ = createConsumer(params);
    const expected$ = m.cold('---0----1--(2|)', [
      {foo: 'bar0'},
      {foo: 'bar1'},
      {foo: 'bar2'},
    ]);
    m.expect(actual$).toBeObservable(expected$);
  }));
});
