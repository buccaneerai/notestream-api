const {expect} = require('chai');
const sinon = require('sinon');
const {marbles} = require('rxjs-marbles/mocha');
const roundTo = require('round-to');

const logAudioStreamProgress = require('./logAudioStreamProgress');
const {
  toMessages
} = logAudioStreamProgress.testExports;

describe('logAudioStreamProgress', () => {
  it('should export a curried function', () => {
    expect(logAudioStreamProgress).to.be.a('function');
    expect(logAudioStreamProgress()).to.be.a('function');
  });

  it('should generate appropriate messages', marbles(m => {
    const buffers = [
      Buffer.from('hasta'),
      Buffer.from('la'),
      Buffer.from('vista'),
      Buffer.from('baby'),
      Buffer.from('!'),
    ];
    const bytesInFirstWindow = (
      Buffer.byteLength(buffers[0])
      + Buffer.byteLength(buffers[1])
    );
    const bytesInSecondWindow = (
      Buffer.byteLength(buffers[2])
      + Buffer.byteLength(buffers[3])
      + Buffer.byteLength(buffers[4])
    );
    const logInterval = 5;
    const params = {
      logInterval,
      config: {runId: 'myrunId', inputType: 'audioStream'},
    };
    const input$ = m.cold('--0-1--2-3(4|)', buffers);
    const actual$ = input$.pipe(toMessages(params));
    const expected$ = m.cold('-----0----(1|)', [
      {
        runId: params.config.runId,
        inputType: params.config.inputType,
        windowIndex: 0,
        windowLength: logInterval,
        start: 0,
        end: 0.01,
        chunkIndexStart: 0,
        chunkIndexEnd: 1,
        chunksInWindow: 2,
        byteIndexStart: 0,
        byteIndexEnd: bytesInFirstWindow,
        bytesInWindow: bytesInFirstWindow,
        avgBytesPerChunk: Math.floor(roundTo(bytesInFirstWindow / 2, 2)),
        avgBytesPerSecond: roundTo(bytesInFirstWindow / logInterval / 1000, 2),
        type: 'log',
      },
      {
        runId: params.config.runId,
        inputType: params.config.inputType,
        windowIndex: 1,
        windowLength: logInterval,
        start: 0.01,
        end: 0.02,
        chunkIndexStart: 2,
        chunkIndexEnd: 4,
        chunksInWindow: 3,
        byteIndexStart: bytesInFirstWindow,
        byteIndexEnd: bytesInFirstWindow + bytesInSecondWindow,
        bytesInWindow: bytesInSecondWindow,
        avgBytesPerChunk: Math.floor(roundTo(bytesInSecondWindow / 3, 2)),
        avgBytesPerSecond: roundTo(bytesInSecondWindow / logInterval / 1000, 2),
        type: 'log'
      },
    ]);
    m.expect(actual$).toBeObservable(expected$);
  }));
});
