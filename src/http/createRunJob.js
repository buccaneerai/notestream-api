const get = require('lodash/get');
const {of} = require('rxjs');

const { NEW_STT_STREAM } = require('../ws/producer');
const consumeOneClientStream = require('../ws/consumeOneClientStream');

const createRunJob = () => (req, res) => {
  const audioFileId = get(req, 'body.audioFileId');
  const mockEncounterId = get(req, 'body.mockEncounterId');
  const token = get(req, 'headers.authorization').replace(/^\s*Bearer\s*/, '');
  const startMessage = {
    type: NEW_STT_STREAM,
    data: {
      audioFileId,
      mockEncounterId,
      inputType: 's3File',
    }
  };
  const output$ = of(startMessage).pipe(
    consumeOneClientStream({
      requestToken: token,
      isSocketIOStream: false,
    })
  );
  output$.subscribe();
  res.send(200);
};

module.exports = createRunJob;
