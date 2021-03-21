const {throwError} = require('rxjs');
const {toS3File} = require('@buccaneerai/rxjs-s3');

const defaultOptions = {
  s3Bucket: process.env.S3_DATA_STORAGE_BUCKET,
  prefixDir: process.env.S3_AUDIO_DIR,
};

const errors = {
  bucketRequired: () => new Error('storeRawAudio requires s3Bucket'),
  prefixDirRequired: () => new Error('storeRawAudio requires prefixDir'),
};

const storeRawAudio = function storeRawAudio(
  runId,
  options = {},
  _toS3File = toS3File
) {
  const config = {...defaultOptions, ...options};
  if (!config.s3Bucket) return () => throwError(errors.bucketRequired());
  if (!config.prefixDir) return () => throwError(errors.prefixDirRequired());
  const s3Key = `${config.prefixDir}/${runId}/audio.linear16`;
  return buffer$ => buffer$.pipe(
    _toS3File({s3Key, s3Bucket: config.s3Bucket})
  );
};

module.exports = storeRawAudio;
