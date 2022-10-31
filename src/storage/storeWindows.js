const AWS = require('aws-sdk');
const {from,of,throwError} = require('rxjs');
const {map,mapTo,mergeMap,scan,takeLast} = require('rxjs/operators');
const {toCSV} = require('@buccaneerai/rxjs-csv');
const {client} = require('@buccaneerai/graphql-sdk');

const errors = {
  badGraphQLResponse: res => new Error(`bad GraphQL response: ${res}`)
};

const defaultS3Client = new AWS.S3({
  region: process.env.AWS_REGION || 'us-east-1',
});

const toS3File = function toS3File({
  noteWindowId,
  s3Bucket,
  s3Key,
  contentType,
  _s3 = defaultS3Client,
}) {
  console.log({noteWindowId, s3Bucket, s3Key, contentType});
  console.log(_s3);
  console.log(process.env.AWS_REGION);
  return source$ => source$.pipe(
    mergeMap(buffer => from(
      _s3.putObject({
        Bucket: s3Bucket,
        Key: s3Key,
        ContentType: contentType,
        Body: buffer,
        Tagging: `noteWindowId=${noteWindowId}&dataType=words`,
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
  _createNoteWindow = gql().createNoteWindow,
  _updateNoteWindow = gql().updateNoteWindow,
  _toCSV = toCSV,
  _toS3File = toS3File
}) {
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
      mergeMap(({_id, wordsS3Bucket, wordsS3Key}) => {
        return wordWindow$.pipe(
          _toCSV(),
          scan((acc, nextCsvStr) => `${acc}\n${nextCsvStr}` , ''),
          takeLast(1),
          map(csvStr => Buffer.from(csvStr, 'utf8')),
          _toS3File({
            runId,
            noteWindowId: _id,
            s3Bucket: wordsS3Bucket,
            s3Key: wordsS3Key,
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
