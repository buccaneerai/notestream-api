const {expect} = require('chai');
// const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');

const audioChunkToLinear16 = require('./audioChunkToLinear16');

describe('audioChunkToLinear16', () => {
  it('should export a function', () => {
    expect(audioChunkToLinear16).to.be.a('function');
  });

  it('should return unaltered input if audioEncoding is linear16', marbles(m => {
    const params = {
      audioEncoding: 'audio/l16',
      sampleRate: 16000,
    };
    const in$ = m.cold('-0-1-(2|)', ['a', 'b', 'c']);
    const result$ = in$.pipe(
      audioChunkToLinear16(params)
    );
    const expected$ = in$;
    m.expect(result$).toBeObservable(expected$);
  }));
});
