const {of, merge} = require('rxjs');
const {mergeMap, retry, take} = require('rxjs/operators');

const {DISCONNECTION, STT_STREAM_STOP, STT_STREAM_COMPLETE} = require('../ws/producer');
const updateRun = require('./updateRun');

const updateStatus = ({runId, _updateRun = updateRun}) => e => {
  const audioCheckpoint = e.log || undefined;
  if (e.type === DISCONNECTION) {
    const { data: { reason = null } = {} } = e;
    if (reason === 'io client disconnect' || reason === 'client namespace disconnect') {
      // user closed the connection purposefully, at this point STT_STREAM_STOP has already been called
      // just return an empty observable
      return of();
    }
    // user was disconnected
    return _updateRun({runId})({status: 'disconnected', audioCheckpoint});
  }
  if (e.type === STT_STREAM_STOP) {
    return _updateRun({runId})({status: 'stopped', audioCheckpoint});
  }
  if (e.type === STT_STREAM_COMPLETE) {
    return _updateRun({runId})({status: 'completed', audioCheckpoint});
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
