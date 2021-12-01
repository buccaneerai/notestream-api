// import pick = require('lodash/pick');
const Joi = require('joi');
const omit = require('lodash/omit');
const {of,throwError,zip} = require('rxjs');
const {filter, map, mergeMap, shareReplay, tap, take} = require('rxjs/operators');
const {client} = require('@buccaneerai/graphql-sdk');

const {NEW_STT_STREAM} = require('./producer');

const getSttEngines = () => ['deepspeech', 'gcp', 'aws', 'awsmed', 'deepgram'];
const getInputTypes = () => ['s3File', 'audioStream'];

const errors = {
  invalidConfig: validationError => new Error(validationError),
  invalidGraphQLResponse: res => new Error(`invalid GraphQL response: ${res}`),
};

const schema = Joi.object({
  streamId: Joi.string().alphanum().min(7).max(30),
  runId: Joi.string().alphanum().min(7).max(30),
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
    .default({baselineSTTEngine: 'aws-medical'}),
  sendSTTOutput: Joi.boolean().default(false),
  channels: Joi.number().integer().default(1).allow(1),
  sampleRate: Joi.number().integer().default(16000).allow(16000),
  audioEncoding: Joi.string().allow(['LINEAR16']).default('LINEAR16'),
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

const gql = (url = process.env.GRAPHQL_URL, token = process.env.JWT_TOKEN) => (
  client({url, token})
);

const getStreamConfig = function getStreamConfig({
  _validate = validate(),
  _createRun = gql().createRun,
} = {}) {
  return stream$ => stream$.pipe(
    filter(eventIsNewSTTStream),
    take(1),
    map(_validate),
    mergeMap(processValidationOrThrow),
    mergeMap(config => zip(
      of(config),
      _createRun({doc: {...omit(config, 'context'), status: 'running'}}).pipe(
        mergeMap(validateAndParseResponse)
      )
    )),
    map(([config, run]) => ({...config, runId: run._id})),
    shareReplay(1)
  );
};

module.exports = getStreamConfig;
module.exports.testExports = {validate};
