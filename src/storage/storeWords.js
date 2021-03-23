const {merge} = require('rxjs');
const {bufferCount,filter,map,mapTo,share} = require('rxjs/operators');
const {toCSV} = require('@buccaneerai/rxjs-csv');
const {toS3File} = require('@buccaneerai/rxjs-s3');

const defaultOptions = {
  s3Bucket: process.env.S3_DATA_STORAGE_BUCKET,
  prefixDir: process.env.S3_JOB_STORAGE_DIR,
  bufferSize: 50,
};

const storeWords = function storeWords({
  runId,
  options = {},
  _toCSV = toCSV,
  _toS3File = toS3File
}) {
  const config = {...defaultOptions, ...options};
  return word$ => {
    const wordSub$ = word$.pipe(share());
    const s3Out$ = wordSub$.pipe(
      _toCSV(),
      bufferCount(config.bufferSize),
      map(csvStrings => csvStrings.reduce((acc, str) => `${acc}${str}`, '')),
      _toS3File({
        s3Key: `${config.prefixDir}/${runId}/words.csv`,
        s3Bucket: config.s3Bucket,
        contentType: 'text/csv',
      }),
      mapTo(1)
    );
    return merge(wordSub$, s3Out$).pipe(filter(d => d !== 1));
  };
};

module.exports = storeWords;
