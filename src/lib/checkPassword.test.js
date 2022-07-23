const {expect} = require('chai');
const sinon = require('sinon');
const { of, Subject } = require('rxjs');

const checkPassword = require('./checkPassword');

describe('checkPassword', () => {
  it('should emit true if passwords match', done => {
    const sub$ = new Subject();
    const plainPassword = 'opensesame';
    const user = {
      hash: '$2b$12$k.ZplRfomxqCfURGQOEct.zWPCpMB996RJECgAjgNKCIsqeqoc7Jq',
    }
    const onData = sinon.spy();
    const onError = sinon.spy();
    const _compare = sinon.stub().returns(of([null, true]));
    const params = {plainPassword, user, _compare};
    const compare$ = checkPassword(params);
    sub$.subscribe(onData, onError, () => {
      expect(onError.called).to.be.false;
      expect(_compare.calledOnce).to.be.true;
      expect(_compare.firstCall.args[0]).to.equal(plainPassword);
      expect(_compare.firstCall.args[1]).to.equal(user.hash);
      expect(onData.calledOnce).to.be.true;
      expect(onData.firstCall.args[0]).to.be.true;
      done();
    });
    compare$.subscribe(sub$);
    console.log(onError.firstCall.args);
  });

  it('shuld throw error observable if passwords do not match', done => {
    const sub$ = new Subject();
    const plainPassword = 'opensesame';
    const user = {hash: '$2b$12$k.ZplRfomxqCfURGQOEct.', };
    const onData = sinon.spy();
    const onError = sinon.spy();
    const _compare = sinon.stub().returns(of([null, false]));
    const params = {plainPassword, user, _compare};
    const compare$ = checkPassword(params);
    sub$.subscribe(onData, err => {
      expect(onData.called).to.be.false;
      expect(err).to.be.an('error');
      done();
    });
    compare$.subscribe(sub$);
  });
});
