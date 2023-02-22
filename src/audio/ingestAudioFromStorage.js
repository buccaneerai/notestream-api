const get = require('lodash/get');
const {throwError} = require('rxjs');
const {map, mergeMap} = require('rxjs/operators');

const logger = require('@buccaneerai/logging-utils');
const {client} = require('@buccaneerai/graphql-sdk');

const streamS3Audio = require('./streamS3Audio');

const errors = {
  audioFileDNE: () => new Error('audio file does not exist'),
  audioFileRequired: () => new Error('audioFileId is required if inputType=s3File'),
};

const gql = (url = process.env.GRAPHQL_URL, token = process.env.JWT_TOKEN) => (
  client({url, token})
);

const ingestAudioFromStorage = ({
  config,
  _gql = gql(),
  _streamS3Audio = streamS3Audio,
  _logger = logger
}) => {
  const audioFileId = get(config, 'audioFileId');
  if (!audioFileId) return throwError(errors.audioFileIdRequired());
  const audioFiles$ = _gql.findAudioFiles({filter: {_id: audioFileId}});
  _logger.info('ingestAudioFromStorage0', {});
  const audioFile$ = audioFiles$.pipe(
    map(response => get(response, 'audioFiles[0]', null))
  );
  _logger.info('ingestAudioFromStorage1', {});
  const chunk$ = audioFile$.pipe(
    logger.toLog('ingestAudioFromStorage.audioFile'),
    mergeMap(audioFile =>
      audioFile
      ? _streamS3Audio({
        s3Bucket: audioFile.s3Bucket,
        s3Key: audioFile.s3Key,
      })
      : throwError(errors.audioFileDNE())
    )
  );
  _logger.info('ingestAudioFromStorage2');
  return chunk$;
};

module.exports = ingestAudioFromStorage;
