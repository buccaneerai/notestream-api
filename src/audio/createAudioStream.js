const get = require('lodash/get');
const { throwError } = require('rxjs');
const {map,mergeMap} = require('rxjs/operators');
const {client} = require('@buccaneerai/graphql-sdk');

const streamS3Audio = require('./streamS3Audio');
const ingestAudioFromClient = require('./ingestAudioFromClient');
const audioChunkToLinear16 = require('./audioChunkToLinear16');

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
      case 'audioStream':
        return clientStream$.pipe(
          ingestAudioFromClient(),
          audioChunkToLinear16({
            audioEncoding: config.audioEncoding,
            sampleRate: config.sampleRate,
            channels: config.channels,
          })
        );
      // case 'fileUpload':
      // return clientStream$.pipe();
      default:
        return throwError(errors.unknownInputType());
    }
  };
};

module.exports = createInputStream;
module.exports.testExports = { errors };
