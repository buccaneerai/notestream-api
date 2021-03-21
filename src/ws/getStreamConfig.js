// import pick = require('lodash/pick');
const Joi = require('joi');
const {of,throwError} = require('rxjs');
const {filter, map, mergeMap, shareReplay, take} = require('rxjs/operators');

const {NEW_STT_STREAM} = require('./producer');

const getSttEngines = () => ['deepspeech', 'gcp', 'aws', 'awsmed', 'deepgram'];
const getInputTypes = () => ['s3File'];

const errors = {
  invalidConfig: validationError => new Error(validationError),
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
    .default(getSttEngines())
    .items(Joi.string().allow(...getSttEngines())),
  preferredSttEngine: Joi.string()
    .allow(...getSttEngines())
    .default('deepspeech'), // FIXME - this should be a smarter method
  channels: Joi.number().integer().default(1).allow(1),
  sampleRate: Joi.number().integer().default(16000).allow(16000),
  audioEncoding: Joi.string().allow(['LINEAR16']).default('LINEAR16'),
  context: Joi.object(),
  useRealtime: Joi.boolean().default(true),
  saveRawAudio: Joi.boolean().default(false),
  saveRawSTT: Joi.boolean().default(false),
  saveNormalizedSTT: Joi.boolean().default(false),
});

const validate = (_schema = schema) => config => _schema.validate(config);

const getStreamConfig = (_validate = validate()) => stream$ => stream$.pipe(
  filter(event => event.type === NEW_STT_STREAM),
  take(1),
  map(event => _validate(event.data)),
  mergeMap(validations => (
    validations.error
    ? throwError(errors.invalidConfig(validations.error))
    : of(validations.value)
  )),
  shareReplay(1)
);

module.exports = getStreamConfig;
module.exports.testExports = {validate};
