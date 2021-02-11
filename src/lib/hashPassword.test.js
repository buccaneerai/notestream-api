import {expect} from 'chai';
import sinon from 'sinon';
import { of, Subject } from 'rxjs';

import hashPassword from './hashPassword';

describe('hashPassword', () => {
  it('should return an observable with the hash<String>', done => {
    const sub$ = new Subject();
    const password = 'opensesame';
    const hash = '$2b$12$k.ZplRfomxqCfURGQOEct.zWPCpMB996RJECgAjgNKCIsqeqoc7Jq';
    const onError = sinon.spy();
    const onData = sinon.spy();
    const _hash = sinon.stub().returns(of([null, hash]));
    const params = {password, _hash};

    const hash$ = hashPassword(params);
    hash$.subscribe(onData, onError, () => {
      expect(onError.called).to.be.false;
      expect(_hash.calledOnce).to.be.true;
      expect(_hash.firstCall.args[0]).to.equal(password);
      expect(onData.calledOnce).to.be.true;
      expect(onData.firstCall.args[0]).to.deep.equal(hash);
      done();
    });
    hashPassword(params).subscribe(sub$);
  });
});
