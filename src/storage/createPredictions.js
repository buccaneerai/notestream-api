const {map,mergeMap} = require('rxjs/operators');
const {createPredictedFinding} = require('@buccaneerai/graphql-sdk');

const createPredictions = function createPredictions({
  runId,
  noteWindowId,
  _createPredictedFinding = createPredictedFinding
}) {
  // prediction: {findingCode:ID!, strategy:String!, confidence:Float}
  return prediction$ => prediction$.pipe(
    mergeMap(prediction => _createPredictedFinding({
      runId,
      noteWindowId,
      findingCode: prediction.findingCode, // FIXME
      strategy: prediction.strategy,
      confidence: prediction.confidence,
    })),
    map(res => res.createPredictedFinding)
  )
};

module.exports = createPredictions;
