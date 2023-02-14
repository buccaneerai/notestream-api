const get = require('lodash/get');
const set = require('lodash/set');
const {interval,merge,of} = require('rxjs');
const {filter} = require('rxjs/operators');

const logger = require('@buccaneerai/logging-utils');

const { NEW_STT_STREAM } = require('../ws/producer');
const consumeOneClientStream = require('../ws/consumeOneClientStream');

const createRunJob = ({
  _consumeOneClientStream = consumeOneClientStream,
  _logger = logger
} = {}) => (req, res) => {
  const audioFileId = get(req, 'body.audioFileId');
  const mockEncounterId = get(req, 'body.mockEncounterId');
  const token = get(req, 'headers.authorization').replace(/^\s*Bearer\s*/, '');
  const context = set(
    {},
    'socket.handshake.auth.token',
    token
  );
  const config = {
    audioFileId,
    mockEncounterId,
    inputType: 's3File',
    saveWords: true,
    useRealtime: true,
  };
  const startMessage = {type: NEW_STT_STREAM, data: {context, ...config}};
  _logger.info('createRunJob.start', {mockEncounterId, audioFileId});
  const startMessage$ = of(startMessage);
  const keepOpen$ = interval(500).pipe(filter(() => false));
  const output$ = merge(startMessage$, keepOpen$).pipe(
    _consumeOneClientStream({isSocketIOStream: false})
  );
  output$.subscribe(
    null,
    err => _logger.error(err),
    () => _logger.info('createRunJob.done', {mockEncounterId, audioFileId})
  );
  res.send(200);
};

module.exports = createRunJob;
