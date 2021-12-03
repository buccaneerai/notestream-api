const {of,timer} = require('rxjs');
const {mapTo,mergeMap,scan} = require('rxjs/operators');

const downloadS3File = require('./downloadS3File');

const streamS3Audio = ({
  s3Key,
  s3Bucket,
  useRealtime = true,
  byteLength = 32000,
  timeInterval = 1000,
  _downloadS3File = downloadS3File
}) => {
  // download 32,000 bytes at a time, which is one second of audio
  const audioChunk$ = _downloadS3File({s3Key, s3Bucket, byteLength}).pipe(
    scan((acc, chunk) => [acc[0] + 1, chunk], [-1, null]),
    // space audio out over time if realtime option is set
    mergeMap(([index, chunk]) => (
      useRealtime
      ? timer(timeInterval * index).pipe(mapTo(chunk))
      : of(chunk)
    ))
  );
  return audioChunk$;
};

module.exports = streamS3Audio;
