const AWS = require('aws-sdk');
const {from,of,throwError} = require('rxjs');
const {map,mapTo,mergeMap,scan,takeLast} = require('rxjs/operators');
const {toCSV} = require('@buccaneerai/rxjs-csv');
const {client} = require('@buccaneerai/graphql-sdk');

const defaultOptions = {
  s3Bucket: process.env.S3_DATA_STORAGE_BUCKET,
  prefixDir: process.env.S3_JOB_STORAGE_DIR,
};

const errors = {
  badGraphQLResponse: res => new Error(`bad GraphQL response: ${res}`)
};

const defaultS3Client = new AWS.S3();

const toS3File = function toS3File({
  runId,
  windowId,
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
        Tagging: `runId=${runId}&windowId=${windowId}&dataType=words`,
      }).promise()
    ))
  );
};

const gql = (url = process.env.GRAPHQL_URL, token = process.env.JWT_TOKEN) => (
  client({url, token})
);


const storeWindows = function storeWindows({
  runId,
  windowIndex,
  start,
  end,
  startTime,
  endTime,
  options = {},
  _createNoteWindow = gql().createNoteWindow,
  _updateNoteWindow = gql().updateNoteWindow,
  _toCSV = toCSV,
  _toS3File = toS3File
}) {
  const config = {...defaultOptions, ...options};
  return wordWindow$ => {
    const doc = {
      runId,
      windowIndex,
      start,
      end,
      timeStarted: startTime,
      timeEnded: endTime,
      wordsUploaded: false,
    };
    const doc$ = _createNoteWindow({doc}).pipe(
      mergeMap(response =>
        response && response.createNoteWindow
        ? of(response.createNoteWindow)
        : throwError(errors.badGraphQLResponse(response))
      )
    );
    const storage$ = doc$.pipe(
      mergeMap(({_id}) => {
        return wordWindow$.pipe(
          _toCSV(),
          scan((acc, nextCsvStr) => `${acc}\n${nextCsvStr}` , ''),
          takeLast(1),
          map(csvStr => Buffer.from(csvStr, 'utf8')),
          _toS3File({
            runId,
            windowId: _id,
            s3Bucket: config.s3Bucket,
            s3Key: `${config.prefixDir}/${runId}/note-windows/${_id}-words.csv`,
            contentType: 'text/csv',
          }),
          takeLast(1),
          mergeMap(() => _updateNoteWindow({docId: _id, set: {}})),
          mapTo(_id)
        );
      })
    );
    return storage$;
  };
};

module.exports = storeWindows;
