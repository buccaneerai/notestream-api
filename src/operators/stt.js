import { merge, EMPTY } from 'rxjs';
import { catchError, map, scan, share, timeout } from 'rxjs/operators';
import { toAWSTranscribe } from '@buccaneerai/stt-aws';
// import { toGCPSpeech } from '@buccaneerai/stt-gcp';
import { toDeepgram } from '@buccaneerai/stt-deepgram';

import toGCP from './toGCP';
import { error as logError } from '../utils/logger';
import mapAwsSttToWords from './mapAwsSttToWords';
import mapGcpSttToWords from './mapGcpSttToWords';
import mapDeepgramSttToWords from './mapDeepgramSttToWords';
import mapDeepSpeechSttToWords from './mapDeepSpeechSttToWords';

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
    operator: toGCP,
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
const pipelineReducer = ({ fileChunk$, pipelines = defaultPipelines() }) => (acc, sttEngine) => [
  ...acc,
  // check if the given strategy should be run
  // create an Observable that applies the strategy
  fileChunk$.pipe(
    // run the STT pipeline
    // trace(`STT_IN:${sttEngine}`),
    pipelines[sttEngine].operator(pipelines[sttEngine].options),
    timeout(15000),
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

// streamConfig is a function which returns the stream configuration object
// fileChunk$ is an observable of Buffers containing audio data
// audio data should be encoded in LINEAR16 format (16-bit PCM raw audio)
// with a single channel and a sample rate of 16000 Hz.
const stt = ({ sttEngines, _pipelineReducer = pipelineReducer }) => fileChunk$ => {
  // share fileChunks to avoid running the observable multiple times
  const fileChunkSub$ = fileChunk$.pipe(share());
  // create an observable for each STT engine's output stream
  const sttObservables = sttEngines.reduce(_pipelineReducer({ fileChunk$: fileChunkSub$ }), []);
  const sttOut$ = merge(...sttObservables);
  return sttOut$;
};

export const testExports = { pipelineReducer };
export default stt;
