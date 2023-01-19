const get = require('lodash/get');
const { throwError } = require('rxjs');
const {map,mergeMap,bufferTime} = require('rxjs/operators');
const {client} = require('@buccaneerai/graphql-sdk');
const {toLinear16} = require('@buccaneerai/rxjs-linear16');

const streamS3Audio = require('./streamS3Audio');
const ingestAudioFromClient = require('./ingestAudioFromClient');
const ingestFromPriorRun = require('./ingestFromPriorRun');
// const audioChunkToLinear16 = require('./audioChunkToLinear16');

const errors = {
  audioFileDNE: () => new Error('audio file does not exist'),
  unknownInputType: () => new Error('unknown input type'),
};

const gql = (url = process.env.GRAPHQL_URL, token = process.env.JWT_TOKEN) => (
  client({url, token})
);

const createInputStream = function createInputStream(
  config,
  _findAudioFiles = gql().findAudioFiles,
  _ingestAudioFromClient = ingestAudioFromClient,
  _ingestFromPriorRun = ingestFromPriorRun,
  _toLinear16 = toLinear16
) {
  return clientStream$ => {
    switch (config.inputType) {
      case 's3File':
        return _findAudioFiles({filter: {_id: config.audioFileId}}).pipe(
          map(response => get(response, 'audioFiles[0]', null)),
          mergeMap(audioFile =>
            audioFile
            ? streamS3Audio({
              s3Bucket: audioFile.s3Bucket,
              s3Key: audioFile.s3Key,
              // s3Key: `${s3Prefix}${config.audioFileId}.linear16`,
            })
            : throwError(errors.audioFileDNE())
          )
        );
      // Stream of audio data. For example, from a web brower.
      case 'audioStream':
        return clientStream$.pipe(
          _ingestAudioFromClient(),
          // TODO: currently only supports raw LINEAR16 (mimeType=audio/l16)
          // _audioChunkToLinear16({
          //   audioEncoding: config.audioEncoding,
          //   sampleRate: config.sampleRate,
          //   channels: config.channels,
          // })
        );
      // From our internal telephone API
      case 'telephoneCall':
        return clientStream$.pipe(
          _ingestAudioFromClient(),
          bufferTime(1000),
          map(chunksArr => Buffer.concat(chunksArr)),
          _toLinear16({
            mimeType: 'audio/x-mulaw',
            sampleRate: 8000,
            channels: 1,
            firstChunkContainsHeaders: false,
          }),
        );
      case 'rerun':
        return clientStream$.pipe(
          _ingestFromPriorRun({runId: config.runId})
        );
      default:
        return throwError(errors.unknownInputType());
    }
  };
};

module.exports = createInputStream;
module.exports.testExports = { errors };
