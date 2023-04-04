const { throwError } = require('rxjs');
const {map,bufferTime} = require('rxjs/operators');
const {toLinear16} = require('@buccaneerai/rxjs-linear16');
const logger = require('@buccaneerai/logging-utils');

const ingestAudioFromStorage = require('./ingestAudioFromStorage');
const ingestAudioFromClient = require('./ingestAudioFromClient');
const ingestFromPriorRun = require('./ingestFromPriorRun');
// const audioChunkToLinear16 = require('./audioChunkToLinear16');

const errors = {
  unknownInputType: () => new Error('unknown input type'),
};

const createInputStream = function createInputStream({
  config,
  _ingestAudioFromStorage = ingestAudioFromStorage,
  _ingestAudioFromClient = ingestAudioFromClient,
  _ingestFromPriorRun = ingestFromPriorRun,
  _toLinear16 = toLinear16,
  _logger = logger
}) {
  return clientStream$ => {
    switch (config.inputType) {
      // Stream data from an existing audio file
      case 's3File':
        _logger.info(
          'createInputStream.s3File',
          {runId: config.runId, audioFileId: config.audioFileId}
        );
        return _ingestAudioFromStorage({config});
      // Stream of audio data. For example, from a web brower.
      case 'audioStream':
        _logger.info('createInputStream.audioStream', {runId: config.runId});
        return clientStream$.pipe(_ingestAudioFromClient());
      // From our internal telephone API
      case 'telephoneCall':
        _logger.info('createInputStream.telephoneCall', {runId: config.runId});
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
      // Re-process an existing run
      case 'rerun':
        _logger.info('createInputStream.rerun', {runId: config.runId});
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
