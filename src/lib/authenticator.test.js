const {expect} = require('chai');
const sinon = require('sinon');
// const {marbles} = require('rxjs-marbles/mocha');

const authenticator = require('./authenticator');

describe('authenticator', () => {
  it('should export a function', () => {
    expect(authenticator).to.be.a('function');
    expect(authenticator()).to.be.a('function');
  });

  it('should call next with an error if token is missing', () => {
    const next = sinon.spy();
    const socket = {
      handshake: {
        auth: {
          token: null,
        }
      }
    };
    const result = authenticator({secret: 'alohomora'})(socket, next);
    expect(next.getCall(0).args[0]).to.be.a('error');
    expect(next.getCall(0).args[0].message).to.deep.equal('Unauthorized');
  });

  it('should call next with an error if token is invalid', () => {
    const next = sinon.spy();
    const socket = {
      handshake: {
        auth: {
          token: 'notatoken',
        }
      }
    };
    const result = authenticator({secret: 'alohomora'})(socket, next);
    expect(next.getCall(0).args[0]).to.be.a('error');
    expect(next.getCall(0).args[0].message).to.deep.equal('Unauthorized');
  });

  it('should call next successfully if token is valid', () => {
    const next = sinon.spy();
    const socket = {
      handshake: {
        auth: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjZhNDgwNmJmYTY5ZmIyYmVhZTcwMjUiLCJlbWFpbCI6ImFkbWluQGJ1Y2NhbmVlci5haSIsImlzQWRtaW4iOnRydWUsImlhdCI6MTYxNDExMTY0NywiZXhwIjoxNjQ1NjQ3NjQ3fQ.adFe-rLbE0KmZoZ2GOZfKZtzQQl3wEXPv9QLPCBmb6Q',
        }
      }
    };
    const result = authenticator({secret: 'alohomora'})(socket, next);
    expect(next.getCall(0).args[0]).to.equal(undefined);
  });
});
