const AWS = require('aws-sdk');
const get = require('lodash/get');
const { from, merge, of, Subject, timer } = require('rxjs');
const { map, mergeMap, tap, toArray } = require('rxjs/operators');

const s3 = new AWS.S3({region: process.AWS_REGION || 'us-east-1'});

const mapS3ResponseToKey = () => item => {
  const arr = item.Key.split('/')
  const key = arr[arr.length - 1];
  // const index = key.split('.')[0];
  // return {...item, key, index: parseInt(index, 10)};
  return key;
};

const s3KeyToBuffer = ({bucket, _s3 = s3}) => s3Key => (
  from(_s3.getObject({Bucket: bucket, Key: s3Key}).promise()).pipe(
    map(response => response.Body)
  )
);

const listKeys = ({bucket, prefix, _s3 = s3}) => (lastResponse = {}) => from(
  _s3
    .listObjectsV2({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: get(lastResponse, 'NextContinuationToken', null),
    })
    .promise()
);

const listAllKeys = ({runId, bucket}) => {
  const prefix = `notestream/runs/${runId}/audio`;
  const nextBatch$ = new Subject();
  const listResponse$ = merge(of({}), nextBatch$).pipe(
    mergeMap(listKeys({bucket, prefix})),
    tap(response => nextBatch$.next(response))
  );
  const s3Key$ = listResponse$.pipe(
    map(mapS3ResponseToKey()),
    mergeMap(keys => of(...keys)) // emit all keys in sequence
  );
  return s3Key$;
};

const ingestFromPriorRun = ({
  runId,
  bucket = process.env.S3_DATA_STORAGE_BUCKET,
  timePerChunk = 5000,
  _listAllKeys = listAllKeys
}) => {
  const s3Key$ = _listAllKeys({bucket, runId}); // list all s3 keys
  const timedBuffer$ = s3Key$.pipe(
    map(s3KeyToBuffer({bucket})), // get an observable for each s3 Buffer
    toArray(), // get a list of all of the observables to fetch S3 data
    // add a timer to each observable to pull data at the correct time
    map(observables => observables.map((obs, i) => obs.pipe(
      mergeMap(() => timer(i * timePerChunk).pipe(mergeMap(() => obs))
    )))),
    mergeMap(observables => merge(...observables))
  );
  return timedBuffer$;
};

module.exports = ingestFromPriorRun;
