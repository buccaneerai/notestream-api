const get = require('lodash/get');
const {merge} = require('rxjs');
const {bufferTime,filter,scan,share} = require('rxjs/operators');
const roundTo = require('round-to');
const AWS = require('aws-sdk');

const defaultOptions = {
  s3Bucket: process.env.S3_AUDIO_BUCKET || process.env.S3_DATA_STORAGE_BUCKET,
};

const defaultS3Client = new AWS.S3();

const toS3File = function toS3File({
  audioFileId,
  runId,
  s3Bucket,
  s3Key,
  contentType,
  data,
  _s3 = defaultS3Client,
}) {
  return _s3.putObject({
      Bucket: s3Bucket,
      Key: s3Key,
      ContentType: contentType,
      Body: data,
      Tagging: `audioFileId=${audioFileId}&runId=${runId}`
    }).promise()
};

const logger = require('../utils/logger');
const trace = require('./trace');

const reduceChunksToMessages = (
  streamConfig,
  logInterval,
  _roundTo = roundTo,
  _logger = logger,
  _toS3File = toS3File
) => (
  (acc, chunks) => {
    const runId = get(streamConfig, 'runId');
    const byteLength = chunks.reduce((acc2, c) => acc2 + Buffer.byteLength(c), 0);
    if (get(streamConfig, 'saveRawAudio')) {
      const data = Buffer.concat(chunks);
      const folder = `notestream/runs/${runId}/audio`;
      const id = acc.windowIndex + 1;
      const key = `${folder}/${id}.linear16`;
      _toS3File({
        audioFileId: id,
        runId,
        s3Bucket: defaultOptions.s3Bucket,
        s3Key: key,
        contentType: 'audio/L16',
        data
      }).then(() => {
        _logger.info(`Wrote file to ${defaultOptions.s3Bucket}/${key}`);
      }).catch((err) => {
        _logger.error(`Unable to write file ${defaultOptions.s3Bucket}/${key}!`)
        _logger.error(err);
      });
    }
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
