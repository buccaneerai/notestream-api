const {throwError} = require('rxjs');

const errors = {
  unsupportedEncoding: encoding => new Error(`unsupported audio encoding: ${encoding}`),
  unsupportedSampleRate: sampleRate => new Error(`unsupported sample rate: ${sampleRate}`),
};

// See: https://cloud.ibm.com/docs/speech-to-text?topic=speech-to-text-audio-formats
// optional: parameters include codecs, rate, channels, endianness
const webStrings = [
  'audio/webm',
  'audio/webm; codecs=opus', // default recording data type from browsers
  'audio/webm; codecs=vorbis',
  'audio/flac', // lossless compression
  'audio/alaw',
  'audio/alaw;rate=16000',
  'audio/alaw; rate=16000',
  'audio/opus',
  'audio/aac',
  'audio/ogg',
  'audio/ogg;codecs=opus',
  'audio/ogg; codecs=opus',
  'audio/ogg;codecs=vorbis',
  'audio/ogg; codecs=vorbis',
  'audio/3gpp',
  'audio/3gpp2',
];

const linear16Strings = [
  'LINEAR16',
  'audio/l16', // lossless and uncompressed
  'audio/l16;rate=16000',
  'audio/l16; rate=16000',
];

const mpegStrings = [
  'audio/mpeg', // .mp3
  'audio/mp3',
];

const wavStrings = [
  'audio/wav', // .wav
];

const audioChunkToLinear16 = ({
  audioEncoding = 'audio/l16',
  sampleRate = 16000,
  // channels = 1,
} = {}) => chunk$ => {
  if (linear16Strings.includes(audioEncoding)) return chunk$;
  if (sampleRate !== 16000) {
    return throwError(errors.unsupportedSampleRate(sampleRate));
  }
  if (mpegStrings.includes(audioEncoding)) {
    return throwError(errors.unsupportedEncoding(audioEncoding));
  }
  if (wavStrings.includes(audioEncoding)) {
    return throwError(errors.unsupportedEncoding(audioEncoding));
  }
  if (webStrings.includes(audioEncoding)) {
    return throwError(errors.unsupportedEncoding(audioEncoding));
  }
  return throwError(errors.unsupportedEncoding(audioEncoding));
};

module.exports = audioChunkToLinear16;
