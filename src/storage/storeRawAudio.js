const AWS = require('aws-sdk');
const {from,merge,throwError} = require('rxjs');
const {filter,mapTo,mergeMap,scan,share,takeLast} = require('rxjs/operators');

const defaultOptions = {
  s3Bucket: process.env.S3_DATA_STORAGE_BUCKET,
  prefixDir: process.env.S3_AUDIO_DIR,
};

const errors = {
  bucketRequired: () => new Error('storeRawAudio requires s3Bucket'),
  prefixDirRequired: () => new Error('storeRawAudio requires prefixDir'),
};

const defaultS3Client = new AWS.S3();

const toS3File = function toS3File({
  audioFileId,
  runId,
  s3Bucket,
  s3Key,
  contentType,
  _s3 = defaultS3Client,
}) {
  return source$ => source$.pipe(
    mergeMap(buffer => from(
      _s3.putObject({
        Bucket: s3Bucket,
        Key: s3Key,
        ContentType: contentType,
        Body: buffer,
        Tagging: `audioFileId=${audioFileId}&runId=${runId}`
      }).promise()
    ))
  );
};

const storeRawAudio = function storeRawAudio({
  audioFileId,
  runId,
  options = {},
  encoding = 'linear16',
  _toS3File = toS3File
}) {
  const config = {...defaultOptions, ...options};
  if (!config.s3Bucket) return () => throwError(errors.bucketRequired());
  if (!config.prefixDir) return () => throwError(errors.prefixDirRequired());
  const s3Key = `${config.prefixDir}/${runId}/audio.${encoding}`;
  return buffer$ => {
    const bufferSub$ = buffer$.pipe(share());
    const storage$ = bufferSub$.pipe(
      scan((acc, buffer) =>
        acc
        ? Buffer.concat([acc, buffer])
        : buffer
      , null),
      takeLast(1),
      _toS3File({
        audioFileId,
        runId,
        s3Key,
        s3Bucket: config.s3Bucket,
        contentType: 'audio/L16',
      }),
      mapTo(0)
    );
    return merge(bufferSub$, storage$).pipe(filter(event => event));
  };
};

module.exports = storeRawAudio;
