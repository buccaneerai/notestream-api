const AWS = require('aws-sdk');
const {from,merge} = require('rxjs');
const {
  bufferCount,
  filter,
  map,
  mapTo,
  mergeMap,
  scan,
  share,
  takeLast
} = require('rxjs/operators');
const {toCSV} = require('@buccaneerai/rxjs-csv');

const defaultOptions = {
  s3Bucket: process.env.S3_DATA_STORAGE_BUCKET,
  prefixDir: process.env.S3_JOB_STORAGE_DIR,
  bufferSize: 50,
};

const defaultS3Client = new AWS.S3();

const toS3File = function toS3File({
  runId,
  s3Bucket,
  s3Key,
  contentType,
  _putObject = defaultS3Client.putObject,
}) {
  return source$ => source$.pipe(
    mergeMap(buffer => from(
      _putObject({
        Bucket: s3Bucket,
        Key: s3Key,
        ContentType: contentType,
        Body: buffer,
        Tagging: `runId=${runId}`
      }).promise()
    ))
  );
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
      map(csvStrings => csvStrings.reduce((acc, str) => `${acc}${str}`, '')),
      scan((acc, nextCsvStr) => `${acc}${nextCsvStr}` , ''),
      takeLast(1),
      map(csvStr => Buffer.from(csvStr, 'utf8')),
      _toS3File({
        runId,
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
