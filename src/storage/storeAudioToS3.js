import {toS3File} from '@buccaneerai/rxjs-s3';

const defaultOptions = {
  s3Key: process.env.S3_AUDIO_DIR,
  s3Bucket: process.env.S3_DATA_STORAGE_BUCKET,
}

const storeAudioToS3 = function storeAudioToS3(options = {}) {
  const config = {...defaultOptions, ...options};
  return chunk$ => {
    toS3File({...config})
  };
};

export default storeAudioToS3;
