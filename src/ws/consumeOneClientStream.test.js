const {expect} = require('chai');
// const sinon = require('sinon');
// const {marbles} = require('rxjs-marbles/mocha');

const consumeOneClientStream = require('./consumeOneClientStream');

describe('consumeOneClientStream', () => {
  it('should export a curried function', () => {
    expect(consumeOneClientStream).to.be.a('function');
    expect(consumeOneClientStream()).to.be.a('function');
  });
});
