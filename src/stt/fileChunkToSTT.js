const { merge, EMPTY } = require('rxjs');
const {
  catchError,
  map,
  scan,
  share,
  tap,
  timeout
} = require('rxjs/operators');
// import { toDeepSpeech } = require('@buccaneerai/stt-deepspeech');
const { toAWSTranscribe } = require('@buccaneerai/stt-aws');
const { toDeepgram } = require('@buccaneerai/stt-deepgram');
const { toGCPSpeech } = require('@buccaneerai/stt-gcp');
const { toIBM } = require('@buccaneerai/stt-ibm');

const logError = require('../utils/logger').error;
const mapAwsSttToWords = require('./mapAwsSttToWords');
const mapGcpSttToWords = require('./mapGcpSttToWords');
const mapDeepgramSttToWords = require('./mapDeepgramSttToWords');
const mapIBMSttToWords = require('./mapIBMSttToWords');
const storeRawSttEvents = require('../storage/storeRawSttEvents');
// import mapDeepSpeechSttToWords = require('./mapDeepSpeechSttToWords';

const defaultPipelines = () => ({
  deepgram: {
    options: {
      username: process.env.DEEPGRAM_USERNAME,
      password: process.env.DEEPGRAM_PASSWORD,
      useSpeakerLabels: true,
      usePunctuation: true,
      interimResults: false,
      sampleRate: 16000,
    },
    operator: toDeepgram,
    transformer: mapDeepgramSttToWords,
    timeout: 20000,
  },
  ibm: {
    options: {
      instanceId: process.env.IBM_STT_INSTANCE_ID,
      region: process.env.IBM_REGION,
      secretAccessKey: process.env.IBM_SECRET_ACCESS_KEY,
      interimResults: false,
      sampleRate: 16000,
    },
    operator: toIBM,
    transformer: mapIBMSttToWords,
    timeout: 20000,
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
    timeout: 20000,
  },
  aws: {
    options: {
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    operator: toAWSTranscribe,
    transformer: mapAwsSttToWords,
    timeout: 15000,
  },
});

// create a list of observables, each of which is the output for one of the
// STT engines requested
const pipelineReducer = function pipelineReducer({
  fileChunk$,
  runId,
  pipelines = defaultPipelines(),
  saveRawSTT = false,
  _storeRawSttEvents = storeRawSttEvents,
}) {
  return (acc, sttEngine) => [
    ...acc,
    // check if the given strategy should be run
    // create an Observable that applies the strategy
    fileChunk$.pipe(
      // run the STT pipeline
      // trace(`STT_IN:${sttEngine}`),
      pipelines[sttEngine].operator(pipelines[sttEngine].options),
      timeout(pipelines[sttEngine].timeout),
      saveRawSTT ? _storeRawSttEvents({runId, sttEngine}) : tap(null),
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
  runId,
  sttEngines,
  saveRawSTT = false,
  _pipelineReducer = pipelineReducer,
}) {
  return fileChunk$ => {
    // share fileChunks to avoid running the observable multiple times
    const fileChunkSub$ = fileChunk$.pipe(share());
    // create an observable for each STT engine's output stream
    const sttObservables = sttEngines.reduce(
      _pipelineReducer({
        runId,
        saveRawSTT,
        fileChunk$: fileChunkSub$
      }),
      []
    );
    const sttOut$ = merge(...sttObservables);
    return sttOut$;
  };
};

module.exports = fileChunkToSTT;
module.exports.testExports = { pipelineReducer };
