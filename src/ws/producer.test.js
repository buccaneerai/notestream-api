const {expect} = require('chai');
const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');
const {of} = require('rxjs');

const {
  DISCONNECTION,
  NEW_STT_STREAM,
  NEXT_AUDIO_CHUNK,
  STT_STREAM_DONE,
  STT_STREAM_STOP,
  fromSocketIO,
  eventResolvers
} = require('./producer');

describe('producer', () => {
  it('should export a function', () => {
    expect(fromSocketIO).to.be.a('function');
  });

  it('should return an observable of observables given a socket.io IO input', marbles(m => {
    const socket = {
      on: sinon.stub().returns(),
    };
    const ns = {
      on: (eventName, cb) => cb(socket),
    };
    const io = {of: sinon.stub().returns(ns)};
    const obs$ = m.cold('--(0|)', [socket]);
    const params = {
      io,
      namespace: '/notestream',
      _mapConnectionToEvents: sinon.stub().returns(() => obs$),
    };
    const clientStream$$ = fromSocketIO(params);
    const expected$ = m.cold('0', [obs$]);
    m.expect(clientStream$$).toBeObservable(expected$);
  }));

  it('should handle disconnect event', () => {
    const handlers = eventResolvers({namespace: '/notestream'});
    const disconnect = handlers['notestream:disconnect'];
    const context = {socket: {}};
    const obs = {
      next: sinon.spy(),
      complete: sinon.spy(),
    };
    const reason = 'some reason';
    disconnect(context, obs, reason);
    expect(obs.next.calledOnce).to.be.true;
    expect(obs.complete.calledOnce).to.be.true;
    expect(obs.next.getCall(0).args[0]).to.deep.equal({
      type: DISCONNECTION,
      data: {context, reason},
    });
  });

  it('should handle next event', () => {
    const handlers = eventResolvers({namespace: '/notestream'});
    const next = handlers['notestream:next-chunk'];
    const context = {socket: {}};
    const obs = {
      next: sinon.spy(),
      complete: sinon.spy(),
    };
    const json = {data: 'somedata'};
    const binary = Buffer.from('foobar');
    next(context, obs, json, binary);
    expect(obs.next.calledOnce).to.be.true;
    expect(obs.next.getCall(0).args[0]).to.deep.equal({
      type: NEXT_AUDIO_CHUNK,
      data: {context, chunk: binary, ...json},
    });
  });

  it('should handle stop event', () => {
    const handlers = eventResolvers({namespace: '/notestream'});
    const stop = handlers['notestream:stop'];
    const context = {socket: {}};
    const obs = {
      next: sinon.spy(),
      complete: sinon.spy(),
    };
    stop(context, obs);
    expect(obs.next.calledOnce).to.be.true;
    expect(obs.next.getCall(0).args[0]).to.deep.equal({
      type: STT_STREAM_STOP,
      data: {context},
    });
  });

  it('should handle complete event', () => {
    const handlers = eventResolvers({namespace: '/notestream'});
    const complete = handlers['notestream:complete'];
    const context = {socket: {}};
    const obs = {
      next: sinon.spy(),
      complete: sinon.spy(),
    };
    const json = {foo: 'bar'};
    complete(context, obs, json);
    expect(obs.next.calledOnce).to.be.true;
    expect(obs.next.getCall(0).args[0]).to.deep.equal({
      type: STT_STREAM_DONE,
      data: {context, foo: 'bar'},
    });
  });

  it('should handle new event', () => {
    const handlers = eventResolvers({namespace: '/notestream'});
    const create = handlers['notestream:new-stream'];
    const context = {socket: {}};
    const obs = {
      next: sinon.spy(),
      complete: sinon.spy(),
    };
    const json = {data: 'foobar'};
    create(context, obs, json);
    expect(obs.next.calledOnce).to.be.true;
    expect(obs.next.getCall(0).args[0]).to.deep.equal({
      type: NEW_STT_STREAM,
      data: {context, ...json},
    });
  });
});
