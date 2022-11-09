const get = require('lodash/get');
const {merge} = require('rxjs');
const {bufferTime,filter,scan,share} = require('rxjs/operators');
const roundTo = require('round-to');

const trace = require('./trace');

const reduceChunksToMessages = (
  streamConfig,
  logInterval,
  _roundTo = roundTo
) => (
  (acc, chunks) => {
    const byteLength = chunks.reduce((acc2, c) => acc2 + Buffer.byteLength(c), 0);
    return {
      runId: get(streamConfig, 'runId'),
      inputType: get(streamConfig, 'inputType'),
      windowIndex: acc.windowIndex + 1,
      windowLength: logInterval,
      start: acc.end,
      end: _roundTo(acc.end + (logInterval / 1000), 2),
      chunkIndexStart: acc.chunkIndexEnd + 1,
      chunkIndexEnd: acc.chunkIndexEnd + chunks.length,
      chunksInWindow: chunks.length,
      byteIndexStart: acc.byteIndexEnd,
      byteIndexEnd: acc.byteIndexEnd + byteLength,
      bytesInWindow: byteLength,
      avgBytesPerChunk: _roundTo(byteLength / chunks.length, 2),
      avgBytesPerSecond: _roundTo(byteLength / logInterval / 1000, 2),
    };
  }
);

const toMessages = ({
  config,
  logInterval,
  initialState = {
    windowIndex: -1,
    windowLength: null,
    start: 0,
    end: 0,
    chunkIndexStart: -1,
    chunkIndexEnd: -1,
    chunksInWindow: null,
    byteIndexStart: 0,
    byteIndexEnd: 0,
    bytesInWindow: null,
    avgBytesPerChunk: null,
    avgBytesPerSecond: null,
  }
}) => fileChunk$ => fileChunk$.pipe(
  bufferTime(logInterval), // cache chunks for time window
  scan(reduceChunksToMessages(config, logInterval), initialState)
);

const logAudioStreamProgress = ({
  config,
  logInterval = 5000,
  eventKey = 'audioStreamProgress',
  emitMessages = false,
  _toMessages = toMessages,
  _trace = trace
} = {}) => fileChunk$ => {
  const fileChunkSub$ = fileChunk$.pipe(share());
  const logs$ = fileChunkSub$.pipe(
    _toMessages({config, logInterval}),
    _trace(eventKey),
    filter(() => emitMessages)
  );
  const out$ = merge(fileChunkSub$, logs$);
  return out$;
};

module.exports = logAudioStreamProgress;
module.exports.testExports = {
  toMessages
};
