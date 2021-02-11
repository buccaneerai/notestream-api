import {expect} from 'chai';
import sinon from 'sinon';
import {observe} from 'rxjs-marbles/mocha';
import {of} from 'rxjs';
import {finalize} from 'rxjs/operators';

import trace from './trace';

describe('trace', () => {
  it('should log the data that passes through the observable', observe(() => {
    const logSpy = sinon.spy();
    const input$ = of(...['foo', 'bar']);
    return input$.pipe(
      trace('output', logSpy),
      finalize(() => {
        expect(logSpy.callCount).to.equal(2);
        expect(logSpy.getCall(0).args[0]).to.equal('output');
        expect(logSpy.getCall(0).args[1]).to.equal('foo');
        expect(logSpy.getCall(1).args[0]).to.equal('output');
        expect(logSpy.getCall(1).args[1]).to.equal('bar');
      })
    );
  }));
});
