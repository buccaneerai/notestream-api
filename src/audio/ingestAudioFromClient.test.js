const {expect} = require('chai');
// const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');

const ingestAudioFromClient = require('./ingestAudioFromClient');
const {
  NEXT_AUDIO_CHUNK,
  STT_STREAM_STOP
} = require('../ws/producer');

describe('ingestAudioFromClient', () => {
  it('should export a function', () => {
    expect(ingestAudioFromClient).to.be.a('function');
  });

  it('should properly ingest audio chunks from a client stream', marbles(m => {
    const events = [
      {type: NEXT_AUDIO_CHUNK, data: {chunk: Buffer.from('abc')}},
      {type: NEXT_AUDIO_CHUNK, data: {chunk: Buffer.from('abc')}},
      {type: STT_STREAM_STOP},
    ];
    const in$ = m.cold('--0-1-(2|)', events);
    const result$ = in$.pipe(ingestAudioFromClient());
    const expected$ = m.cold('--0-1-|', [
      events[0].data.chunk,
      events[1].data.chunk,
    ]);
    m.expect(result$).toBeObservable(expected$);
  }));
});
