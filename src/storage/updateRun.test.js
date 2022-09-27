const {expect} = require('chai');
const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');
const {of, throwError} = require('rxjs');

const updateRun = require('./updateRun');
const {errors} = updateRun.testExports;

describe('updateRun', () => {
  it('should export a function', () => {
    expect(updateRun).to.be.a('function');
  });

  it('should throw if runId is not given', marbles(m => {
    const runId = undefined;
    const _gql = {
      updateRun: sinon.stub().returns(
        m.cold('--0|', [{updateStatus: 'foobar'}])
      )
    };
    const set = {status: 'disconnected'};
    const actual$ = updateRun({runId, _gql: _gql})(set);
    const expected$ = m.cold('#', null, errors.runIdRequired());
    m.expect(actual$).toBeObservable(expected$);
  }));

  it('should return error if update fails', marbles(m => {
    const error = new Error('bad request');
    const runId = 'myrunid';
    const _gql = {
      updateRun: sinon.stub().returns(
        m.cold('--#', null, error)
      )
    };
    const set = {status: 'disconnected'};
    const actual$ = updateRun({runId, _gql: _gql})(set);
    const expected$ = m.cold('--#', null, error);
    m.expect(actual$).toBeObservable(expected$);
  }));

  it('should send update if valid input data is provided', marbles(m => {
    const fakeResponse = {updateStatus: 'foobar'};
    const runId = 'myrunid';
    const _gql = {
      updateRun: sinon.stub().returns(
        m.cold('--0|', [fakeResponse])
      )
    };
    const set = {status: 'disconnected'};
    const actual$ = updateRun({
      runId,
      _gql: _gql,
    })(set);
    const expected$ = m.cold('--0|', [fakeResponse]);
    m.expect(actual$).toBeObservable(expected$);
  }));
});
