const {expect} = require('chai');
const sinon = require('sinon');
const {observe} = require('rxjs-marbles/mocha');
const {of} = require('rxjs');
const {finalize} = require('rxjs/operators');

const trace = require('./trace');

describe('trace', () => {
  it('should log the data that passes through the observable', observe(() => {
    const logSpy = sinon.spy();
    const input$ = of(...[{context: 'donotlog', name: 'foo'}, {name: 'bar'}]);
    return input$.pipe(
      trace('output', {blacklist: ['context']}, logSpy),
      finalize(() => {
        expect(logSpy.callCount).to.equal(2);
        expect(logSpy.getCall(0).args[0]).to.equal('output');
        expect(logSpy.getCall(0).args[1]).to.deep.equal({name: 'foo'});
        expect(logSpy.getCall(1).args[0]).to.equal('output');
        expect(logSpy.getCall(1).args[1]).to.deep.equal({name: 'bar'});
      })
    );
  }));
});
