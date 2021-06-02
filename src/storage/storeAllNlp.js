const AWS = require('aws-sdk');
const {from,of,throwError} = require('rxjs');
const {map,mergeMap,scan,takeLast} = require('rxjs/operators');
const {toCSV} = require('@buccaneerai/rxjs-csv');

const defaultOptions = {
  s3Bucket: process.env.S3_DATA_STORAGE_BUCKET,
  prefixDir: process.env.S3_JOB_STORAGE_DIR,
};

const defaultS3Client = new AWS.S3();

const toS3File = function toS3File({
  runId,
  noteWindowId,
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
        Tagging: `runId=${runId}&noteWindowId=${noteWindowId}&dataType=nlp`,
      }).promise()
    ))
  );
};

const storeAllNlp = function storeAllNlp({
  runId,
  windowIndex,
  startTime,
  endTime,
  options = {},
  _createNoteWindow = createNoteWindow,
  _updateNoteWindow = updateNoteWindow,
  _toCSV = toCSV,
  _toS3File = toS3File
}) {
  const config = {...defaultOptions, ...options};
  return nlpEvents$ => {
    nlpEvents$.pipe(
      mergeMap(nlpEvents => of(...nlpEvents)),
      _toCSV(),
      scan((acc, nextCsvStr) => `${acc}\n${nextCsvStr}` , ''),
      takeLast(1),
      map(csvStr => Buffer.from(csvStr, 'utf8')),
      _toS3File({
        runId,
        noteWindowId: _id,
        s3Bucket: config.s3Bucket,
        s3Key: `${config.prefixDir}/${runId}/note-windows/${_id}-nlp.csv`,
        contentType: 'text/csv',
      }),
      takeLast(1),
    );
    return storage$;
  };
};

module.exports = storeAllNlp;
