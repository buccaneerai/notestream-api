const roundTo = require('round-to');
const {timer} = require('rxjs');
const {
  distinct,
  filter,
  map,
  mergeMap,
  scan,
  shareReplay,
  takeUntil,
  tap
} = require('rxjs/operators');

const storeWindows = require('../storage/storeWindows');
// const trace = require('../operators/trace');

const createWindows = function createWindows({
  runId,
  saveWindows = false,
  windowLength = 20000, // how long each window should be (in milliseconds)
  // how long to wait before closing a window (in milliseconds)
  windowTimeoutInterval = 15000,
  _storeWindows = storeWindows
}) {
  return word$ => {
    const wordSub$ = word$.pipe(shareReplay(100));
    const windowIndex$ = wordSub$.pipe(
      // calculate the end timestamp of the most recent (in time) word
      scan((acc, w) => w.end > acc ? w.end : acc, 0),
      // calculate the window index/number for the last word
      map(endTime => roundTo.down(endTime / (windowLength / 1000), 0)),
      // use each index only once
      distinct(),
    );
    // FIXME: make sure this does not drop the first word in each index...
    const windowWords$ = windowIndex$.pipe(
      mergeMap(i => {
        const closeWindow$ = timer(windowLength + windowTimeoutInterval);
        return wordSub$.pipe(
          filter(w =>
            w.start >= i * (windowLength / 1000)
            && w.end < (i + 1) * (windowLength / 1000)
          ),
          // tap(w => console.log(`createWindows.[${i}]`, w)),
          takeUntil(closeWindow$),
          (
            saveWindows
            ? _storeWindows({
              runId,
              windowLength,
              windowTimeoutInterval,
              windowIndex: i,
              start: i * windowLength / 1000,
              end: (i + 1) * windowLength / 1000,
              startTime: i * windowLength,
              endTime: (i + 1) * windowLength
            })
            : tap(null)
          ),
          // timeout(windowTimeoutInterval)
        );
      })
    );
    return windowWords$;
  };
};

module.exports = createWindows;
