const { merge, EMPTY } = require('rxjs');
const { catchError, map, scan, share, timeout } = require('rxjs/operators');
const { toAWSTranscribe } = require('@buccaneerai/stt-aws');
// import { toDeepSpeech } = require('@buccaneerai/stt-deepspeech');
const { toGCPSpeech } = require('@buccaneerai/stt-gcp');
const { toDeepgram } = require('@buccaneerai/stt-deepgram');

const logError = require('../utils/logger').error;
const mapAwsSttToWords = require('./mapAwsSttToWords');
const mapGcpSttToWords = require('./mapGcpSttToWords');
const mapDeepgramSttToWords = require('./mapDeepgramSttToWords');
const storeRawSttEvents = require('../storage/storeRawSttEvents');
// import mapDeepSpeechSttToWords = require('./mapDeepSpeechSttToWords';

const defaultPipelines = () => ({
  deepgram: {
    options: {
      username: process.env.DEEPGRAM_USERNAME,
      password: process.env.DEEPGRAM_PASSWORD,
    },
    operator: toDeepgram,
    transformer: mapDeepgramSttToWords,
  },
  // deepspeech: {
  //   options: {
  //     modelDir: process.env.DEEPSPEECH_MODEL_PATH,
  //     bufferSize: 3,
  //   },
  //   operator: toDeepSpeech,
  //   transformer: mapDeepSpeechSttToWords,
  // },
  gcp: {
    options: {
      googleCreds: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      sampleRate: 16000,
    },
    operator: toGCPSpeech,
    transformer: mapGcpSttToWords,
  },
  aws: {
    options: {
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    operator: toAWSTranscribe,
    transformer: mapAwsSttToWords,
  },
});

// create a list of observables, each of which is the output for one of the
// STT engines requested
const pipelineReducer = function pipelineReducer({
  fileChunk$,
  encounterId,
  pipelines = defaultPipelines(),
  storeOutput = false,
}) {
  return (acc, sttEngine) => [
    ...acc,
    // check if the given strategy should be run
    // create an Observable that applies the strategy
    fileChunk$.pipe(
      // run the STT pipeline
      // trace(`STT_IN:${sttEngine}`),
      pipelines[sttEngine].operator(pipelines[sttEngine].options),
      timeout(15000),
      (
        storeOutput
        ? storeRawSttEvents({encounterId, sttEngine})
        : data => data // pass data through
      ),
      // trace(`STT_RAW:${sttEngine}`),
      // transform output to standard format
      pipelines[sttEngine].transformer(),
      // keep track of the index for each word
      scan((state, event) => [event, state[1] + 1], [null, -1]),
      // attach STT engine name to event
      map(([event, index]) => ({ ...event, sttEngine, i: index })),
      catchError(err => {
        logError(`Error in STT pipeline: ${sttEngine} `, err);
        return EMPTY;
      })
    ),
  ];
};

// streamConfig is a function which returns the stream configuration object
// fileChunk$ is an observable of Buffers containing audio data
// audio data should be encoded in LINEAR16 format (16-bit PCM raw audio)
// with a single channel and a sample rate of 16000 Hz.
const fileChunkToSTT = function fileChunkToSTT({
  encounterId,
  sttEngines,
  _pipelineReducer = pipelineReducer
}) {
  return fileChunk$ => {
    // share fileChunks to avoid running the observable multiple times
    const fileChunkSub$ = fileChunk$.pipe(share());
    // create an observable for each STT engine's output stream
    const sttObservables = sttEngines.reduce(
      _pipelineReducer({ fileChunk$: fileChunkSub$, encounterId }),
      []
    );
    const sttOut$ = merge(...sttObservables);
    return sttOut$;
  };
};

module.exports = fileChunkToSTT;
module.exports.testExports = { pipelineReducer };
