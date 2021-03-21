const dotenv = require('dotenv');
const {fromS3File} = require('@buccaneer/rxjs-s3');
const {fileChunkToSTT} = require('../src/stt');

const defaultOptions = {
  sttEngines: ['gcp', 'aws', 'deepgram'],
};

const s3FileToSTT = (s3Key, options = {}) => () => {
  const config = {...defaultOptions, ...options};
  const buffer$ = fromS3File({s3Key,s3Bucket});
  const stt$ = buffer$.pipe(
    // TODO: This pipeline needs to save the raw output if saveOutput is true
    fileChunkToSTT(config)
  );
  return stt$;
};

module.exports = s3FileToSTT;
