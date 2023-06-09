const AWS = require('aws-sdk');
const {from,of,throwError} = require('rxjs');
const {map,mapTo,mergeMap,scan,takeLast,tap} = require('rxjs/operators');
const {toCSV} = require('@buccaneerai/rxjs-csv');
const {client} = require('@buccaneerai/graphql-sdk');
const logger = require('@buccaneerai/logging-utils');

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
  logger.info(`Writing file to s3 ${s3Bucket}/${s3Key}`);
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
    // Note window is created -> sqs message is created before words are stored
    const doc$ = _createNoteWindow({doc}).pipe(
      mergeMap(response =>
        response && response.createNoteWindow
        ? of(response.createNoteWindow)
        : throwError(errors.badGraphQLResponse(response))
      )
    );
    const storage$ = doc$.pipe(
      mergeMap(({_id, wordsS3Bucket, wordsS3Key}) => {
        logger.info(`Queueing the first window for run: ${runId} notewindow:${_id}`);
        return _updateNoteWindow({docId: _id, set: {
          queueWindow: windowIndex === 0,
        }}).pipe(map(() => {
          logger.info(`Sending to S3 for run: ${runId} notewindow:${_id}`);
          return {_id, wordsS3Bucket, wordsS3Key};
        }));
      }),
      mergeMap(({_id, wordsS3Bucket, wordsS3Key}) => {
        return wordWindow$.pipe(
          _toCSV(), // @TODO make sure taht it always at least creates a valid csv
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
          tap(() => {
            logger.info(`Saved to S3 for run: ${runId} notewindow:${_id}}`);
          }),
          takeLast(1),
          // mergeMap(() => {
          //   logger.info(`Queueing the first window for ${_id}`);
          //   return _updateNoteWindow({docId: _id, set: {
          //     queueWindow: windowIndex === 0,
          //   }});
          // }),
          mapTo(_id)
        );
      })
    );
    return storage$;
  };
};

module.exports = storeWindows;
