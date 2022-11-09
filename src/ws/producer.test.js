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

  it('should handle disconnect event', () => {
    const handlers = eventResolvers();
    const disconnect = handlers['disconnect'];
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
    const handlers = eventResolvers();
    const next = handlers['next-chunk'];
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
    const handlers = eventResolvers();
    const stop = handlers['stop'];
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
    const handlers = eventResolvers();
    const complete = handlers['complete'];
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
    const handlers = eventResolvers();
    const create = handlers['new-stream'];
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
