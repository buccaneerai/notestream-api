const get = require('lodash/get');
const set = require('lodash/set');
const {of} = require('rxjs');

const { NEW_STT_STREAM } = require('../ws/producer');
const consumeOneClientStream = require('../ws/consumeOneClientStream');

const createRunJob = () => (req, res) => {
  const audioFileId = get(req, 'body.audioFileId');
  const mockEncounterId = get(req, 'body.mockEncounterId');
  const token = get(req, 'headers.authorization').replace(/^\s*Bearer\s*/, '');
  const context = set(
    {},
    'socket.handshake.auth.token',
    token
  );
  const startMessage = {
    type: NEW_STT_STREAM,
    data: {
      context,
      audioFileId,
      mockEncounterId,
      inputType: 's3File',
    },
  };
  const output$ = of(startMessage).pipe(
    consumeOneClientStream({isSocketIOStream: false})
  );
  output$.subscribe();
  res.send(200);
};

module.exports = createRunJob;
