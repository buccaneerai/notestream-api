const {of,throwError} = require('rxjs');
const {mapTo,mergeMap,take} = require('rxjs/operators');
const {toS3File} = require('@buccaneerai/rxjs-s3');

const defaultOptions = {
  s3Bucket: process.env.S3_DATA_STORAGE_BUCKET,
  prefixDir: process.env.S3_JOB_STORAGE_DIR,
};

const errors = {
  bucketRequired: () => new Error('storeRunConfig requires s3Bucket'),
  prefixDirRequired: () => new Error('storeRunConfig requires prefixDir'),
  parsingErr: () => new Error('storeRunConfig could not parse config to JSON'),
};

const storeRunConfig = function storeRunConfig(
  options = {},
  _toS3File = toS3File
) {
  const config = {...defaultOptions, ...options};
  if (!config.s3Bucket) return () => throwError(errors.bucketRequired());
  if (!config.prefixDir) return () => throwError(errors.prefixDirRequired());
  return config$ => config$.pipe(
    take(1),
    mergeMap(job => {
      try {
        const jobJSON = JSON.stringify(job);
        const s3Key = `${config.prefixDir}/${job.runId}/config.json`;
        return of(jobJSON).pipe(
          _toS3File({
            s3Key,
            s3Bucket: config.s3Bucket,
            contentType: 'application/json'
          }),
          mapTo(job)
        );
      } catch (e) {
        console.error(e);
        return throwError(errors.parsingErr());
      }
    })
  );
};

module.exports = storeRunConfig;
