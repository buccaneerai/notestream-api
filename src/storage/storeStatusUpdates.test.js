const {expect} = require('chai');
const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');
const {of,throwError} = require('rxjs');

const {DISCONNECTION, STT_STREAM_STOP, STT_STREAM_COMPLETE} = require('../ws/producer');
const storeStatusUpdates = require('./storeStatusUpdates');
const {updateStatus} = storeStatusUpdates.testExports;

const fakeConfig = {
  runId: 'myrunid',
};

describe('storeStatusUpdates', () => {
  it('should export a curried function', () => {
    expect(storeStatusUpdates).to.be.a('function');
  });

  it('should attempt retries before erroring out', marbles(m => {
    const events = [
      {type: STT_STREAM_STOP},
      {type: DISCONNECTION},
    ];
    const error = new Error('bad response');
    const updateStatus = sinon.stub().returns(m.cold('#', null, error));
    const end$ = m.cold('--0-1|', events);
    const complete$ = m.cold('-----|', []);
    const config$ = m.cold('-(0|)', [fakeConfig]);
    const actual$ = storeStatusUpdates({
      config$,
      end$,
      complete$,
      _updateStatus: () => updateStatus,
      retryConfig: {count: 3, delay: 0},
     });
    const expected$ = m.cold('------------#', null, error);
    m.expect(actual$).toBeObservable(expected$);
  }));

  it('should return stream of updates given valid input', marbles(m => {
    const events = [
      {type: STT_STREAM_STOP},
      {type: DISCONNECTION},
    ];
    const fakeResponse = {updateRun: {_id: fakeConfig.runId}};
    const updateStatus = sinon.stub().returns(m.cold('(-0|)', [fakeResponse]));
    const end$ = m.cold('--0-1|', events);
    const complete$ = m.cold('-----|', []);
    const config$ = m.cold('-(0|)', [fakeConfig]);
    const actual$ = storeStatusUpdates({
      config$,
      end$,
      complete$,
      _updateStatus: () => updateStatus,
      retryConfig: {count: 3, delay: 0},
     });
    const expected$ = m.cold('---0-1|', [fakeResponse, fakeResponse]);
    m.expect(actual$).toBeObservable(expected$);
  }));

  it('.updateStatus should return a function that returns an observable', marbles(m => {
    const fakeResponse = {updateRun: {_id: fakeConfig.runId}};
    const updateRun = sinon.stub().returns(of(fakeResponse));
    const actual$ = updateStatus({
      runId: 'myrunid',
      _updateRun: () => updateRun
    })({type: DISCONNECTION});
    const expected$ = m.cold('(-0|)', [fakeResponse]);
    m.expect(actual$).toBeObservable(expected$);
  }));
});
