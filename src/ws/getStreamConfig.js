// import pick = require('lodash/pick');
const Joi = require('joi');
const get = require('lodash/get');
const omit = require('lodash/omit');
const {of,throwError,zip} = require('rxjs');
const {
  filter,
  map,
  mergeMap,
  share,
  shareReplay,
  take
} = require('rxjs/operators');
const {client} = require('@buccaneerai/graphql-sdk');

const {NEW_STT_STREAM} = require('./producer');

const getSttEngines = () => ['deepspeech', 'gcp', 'aws', 'awsmed', 'deepgram'];
const getInputTypes = () => ['s3File', 'audioStream', 'telephoneCall'];
const getSupportedAudioMimeTypes = () => [
  // linear16
  'LINEAR16',
  'audio/l16',
  'audio/linear16',
  // Mulaw (most typically for phone calls)
  'audio/x-mulaw',
  'audio/basic',
  'audio/mulaw',
  // TODO: WAV
  // TODO: MPEG
  // FLAC
  // 'audio/flac',
];

const errors = {
  invalidConfig: validationError => new Error(validationError),
  invalidGraphQLResponse: res => new Error(`invalid GraphQL response: ${res}`),
  noToken: () => new Error('unauthorized'),
};

const schema = Joi.object({
  streamId: Joi.string().alphanum().min(7).max(30),
  runId: Joi.string().alphanum().min(7).max(30),
  telephoneCallId: Joi.string().alphanum().min(7).max(30),
  encounterId: Joi.string().alphanum().min(7).max(30),
  accountId: Joi.string().alphanum().min(7).max(30),
  inputType: Joi.string().required().allow(...getInputTypes()),
  audioFileId: Joi.string()
    .alphanum()
    .min(7)
    .when('inputType', {is: 's3File', then: Joi.required()}),
  sttEngines: Joi.array()
    .items(Joi.string().allow(...getSttEngines()))
    .default(['aws-medical', 'gcp', 'ibm', 'deepgram']),
  ensemblers: Joi.array()
    .items(Joi.string())
    .default(['tfEnsembler']),
  ensemblerOptions: Joi.object()
    .default({baselineSTTEngine: process.env.BASELINE_STT_ENGINE || 'gcp'}),
  sendSTTOutput: Joi.boolean().default(false),
  channels: Joi.number().integer().default(1).allow(1),
  sampleRate: Joi.number().integer().default(16000).allow(16000),
  audioEncoding: Joi.string()
    .allow(getSupportedAudioMimeTypes())
    .default('audio/l16'),
  context: Joi.object(),
  useRealtime: Joi.boolean().default(true),
  saveRawAudio: Joi.boolean().default(true),
  saveRawSTT: Joi.boolean().default(true),
  saveWords: Joi.boolean().default(true),
  saveWindows: Joi.boolean().default(true),
  windowLength: Joi.number().integer().default(20000),
  windowTimeoutInterval: Joi.number().integer().default(15000),
});

const validate = (_schema = schema) => (
  configEvent => _schema.validate(configEvent.data)
);

const eventIsNewSTTStream = event => event.type === NEW_STT_STREAM;

const processValidationOrThrow = validations => (
  validations.error
  ? throwError(errors.invalidConfig(validations.error))
  : of(validations.value)
);

const validateAndParseResponse = response => (
  response && response.createRun
  ? of(response.createRun)
  : throwError(errors.invalidGraphQLResponse(response))
);

const getTokenOrThrow = () => e => {
  const token = get(e, 'data.context.socket.handshake.auth.token');
  if (token) return of(token);
  return throwError(errors.noToken());
};

const getStreamConfig = function getStreamConfig({
  _validate = validate(),
  _gql = client,
  url = process.env.GRAPHQL_URL,
} = {}) {
  return stream$ => {
    const streamSub$ = stream$.pipe(
      filter(eventIsNewSTTStream),
      share()
    );
    const config$ = streamSub$.pipe(
      take(1),
      map(e => ({...e, data: omit(e.data, 'context')})),
      map(_validate),
      mergeMap(processValidationOrThrow)
    );
    const token$ = streamSub$.pipe(mergeMap(getTokenOrThrow()));
    const configWithAccountId$ = zip(config$, token$).pipe(
      mergeMap(([config, token]) => zip(
        of(config),
        _gql({url, token}).findEncounters({filter: {_id: config.encounterId}})
      )),
      map(([config, {encounters}]) => ({...config, accountId: encounters[0].accountId})),
      shareReplay(1)
    );
    const configWithRunId$ = zip(configWithAccountId$, token$).pipe(
      mergeMap(([config, token]) => {
        return zip(
          of(config),
          _gql({url, token}).createRun({
            doc: {...omit(config, 'context'), status: 'running'}
          }).pipe(
            mergeMap(validateAndParseResponse)
          )
        );
      }),
      map(([config, run]) => ({...config, runId: run._id})),
      shareReplay(1)
    );
    return configWithRunId$;
  };
};

module.exports = getStreamConfig;
module.exports.testExports = {validate};
