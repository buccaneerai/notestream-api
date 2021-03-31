const dotenv = require('dotenv');
const {of,throwError} = require('rxjs');
const {fromS3File} = require('@buccaneer/rxjs-s3');
const {conduit} = require('@bottlenose/rxsocketio');

const {fileChunkToSTT} = require('../src/stt');

const defaultOptions = {
  sttEngines: ['gcp', 'aws', 'deepgram'],
  saveRawAudio: false,
  saveRawSTT: false,
  saveWords: false,
  wsUrl: 'localhost:9081',
};

const processViaSocketIO = function processViaSocketIO({
  audioFileId,
  saveAudioFile,
  saveRawAudio,
  saveRawSTT,
  saveWords,
  socketUrl,
  _conduit = conduit
}) {
  const streamId = _randomstring.generate(7);
  const config = {
    // ...defaultSpeechToNoteOptions,
    audioFileId,
    sttEngines,
    preferredSttEngine,
    inputType: 's3File',
    saveRawAudio,
    saveRawSTT,
    saveWords,
  };
  const firstMessage = {streamId, topic: 'new-stt-stream', ...config};
  try {
    const eventFromServer$ = of(firstMessage).pipe(
      _conduit({
        url: socketUrl,
        // topics: ['stt-output', 'nlp', 'predictedElement', 'stream-complete'],
        socketOptions: {transports: ['websocket']},
      }),
      // trace('WS.messageOut')
    );
    return eventFromServer$;
  } catch (e) {
    return throwError(e);
  }
};

const encounterToSTT = function encounterSTT(
  audioFileId,
  options = {},
) {
  return () => {
    const config = {...defaultOptions, ...options};
    const stt$ = processViaSocketIO({audioFileId, ...config});
    return stt$;
  };
};

module.exports = s3FileToSTT;
