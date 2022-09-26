const {of, merge} = require('rxjs');
const {mergeMap, retry, take} = require('rxjs/operators');

const {DISCONNECTION, STT_STREAM_STOP} = require('../ws/producer');
const {STT_COMPLETE} = require('../ws/consumeOneClientStream');
const updateRun = require('./updateRun');

const updateStatus = ({runId, _updateRun = updateRun}) => e => {
  if (e.type === DISCONNECTION) {
    return _updateRun({runId})({status: 'disconnected'});
  }
  if (e.type === STT_STREAM_STOP) {
    return _updateRun({runId})({status: 'stopped'});
  }
  if (e.type === STT_COMPLETE) {
    return _updateRun({runId})({status: 'completed'});
  }
  // if event is not recognized, return an empty observable
  return of();
};

const storeStatusUpdates = ({
  config$, // config$ Observable
  end$, // Observable of end events (stop, disconnect)
  complete$, // STT complete event
  _updateStatus = updateStatus,
  retryConfig = {count: 3, delay: 10000},
}) => (
  config$.pipe(
    take(1),
    mergeMap(config =>
      merge(end$, complete$).pipe(
        mergeMap(_updateStatus({runId: config.runId}))
      )
    ),
    retry(retryConfig)
  )
);

module.exports = storeStatusUpdates;
module.exports.testExports = {
  updateStatus
};
