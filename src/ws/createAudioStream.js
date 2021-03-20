const { throwError } = require('rxjs');

const streamS3Audio = require('../operators/streamS3Audio');
const ingestAudioFromClient = require('./ingestAudioFromClient');

const errors = {
  audioFileDNE: () => new Error('audio file does not exist'),
};

const createInputStream = (
  config,
  s3Bucket = process.env.S3_AUDIO_BUCKET,
  s3Prefix = 'demo/'
) => clientStream$ => {
  switch (config.inputType) {
    case 's3File':
      return streamS3Audio({
        s3Bucket,
        s3Key: `${s3Prefix}${config.audioFileId}.linear16`,
      });
    case 'audioStream':
      return clientStream$.pipe(ingestAudioFromClient());
    // case 'fileUpload':
    // return clientStream$.pipe();
    default:
      return throwError(new Error('unknown input type'));
  }
};

module.exports.testExports = { errors };
module.exports = createInputStream;
