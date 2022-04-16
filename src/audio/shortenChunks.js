const _ = require('lodash');
const {of} = require('rxjs');
const {mergeMap} = require('rxjs/operators');

const sliceBuffer = (buffer, cutoffLength) => index => {
  return buffer.slice(index * cutoffLength, (index + 1) * cutoffLength);
};

const shortenChunks = (cutoffLength = 512) => {
  return fileChunk$ => fileChunk$.pipe(
    mergeMap(fileChunk => {
      const numChunks = Math.ceil(fileChunk.length / cutoffLength);
      const chunks = _.times(numChunks)
        .map(sliceBuffer(fileChunk, cutoffLength));
      return of(...chunks);
    })
  );
};

module.exports = shortenChunks;
