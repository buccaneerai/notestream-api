const AWS = require('aws-sdk');
const {concat,from,merge} = require('rxjs');
const {filter,map,mapTo,mergeMap,scan,share} = require('rxjs/operators');

const defaultOptions = {
  s3Bucket: process.env.S3_DATA_STORAGE_BUCKET,
  prefixDir: process.env.S3_JOB_STORAGE_DIR,
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
        Tagging: `runId=${runId}`,
      }).promise()
    ))
  );
};

const storeRawSttEvents = function storeRawSttEvents(
  {runId, sttEngine},
  options = {},
  _toS3File = toS3File
) {
  const config = {...defaultOptions, ...options};
  const s3Key = `${config.prefixDir}/${runId}/${sttEngine}.json`;
  return buffer$ => {
    const bufferSub$ = buffer$.pipe(share());
    const jsonStr$ = concat(
      '[',
      bufferSub$.pipe(
        map(data => {
          try {
            const jsonStr = JSON.stringify(data);
            return jsonStr;
          } catch (e) {
            return '';
          }
        })
      ),
      ']'
    );
    const s3Res$ = jsonStr$.pipe(
      scan((acc, jsonStr) => `${acc}${jsonStr}`, ''),
      _toS3File({
        runId,
        s3Key,
        s3Bucket: config.s3Bucket,
        contentType: 'application/json',
      }),
      mapTo(0)
    );
    return merge(bufferSub$, s3Res$).pipe(filter(event => event));
  };
};

module.exports = storeRawSttEvents;
