const {expect} = require('chai');
const {marbles} = require('rxjs-marbles/mocha');
const sinon = require('sinon');
const {of} = require('rxjs');

const predictElements = require('./predictElements');
const {testExports} = predictElements;
const {
  matchIsSNOMED,
  mapPatternMatchToPrediction,
  mapNLPEventToPredictions,
  mapStreamToPatternMatcherPredictions,
  getElementsAndChildrenFromCodes
} = testExports;

describe('predictElements', () => {
  it('.matchIsSNOMED should return true for SNOMED IDs and false for non-SNOMED IDs', () => {
    const notSnomed = matchIsSNOMED({matchId: 'LS_12345abcde'});
    const alsoNotSnomed = matchIsSNOMED({matchId: null});
    const snomedCode = matchIsSNOMED({matchId: '01234567'});
    expect(notSnomed).to.equal(false);
    expect(alsoNotSnomed).to.equal(false);
    expect(snomedCode).to.equal(true);
  });

  it('.mapPatternMatchToPrediction should map NLP match to a prediction object', () => {
    const actual = mapPatternMatchToPrediction({matchId: '1234567'});
    const expected = {sctid: '1234567', confidence: 0.50};
    expect(actual).to.deep.equal(expected);
  });

  it('.mapNLPEventToPredictions should map NLP noteStream event to prediction', () => {
    const nlpEvent = {
      entities: [],
      tokens: [],
      matches: [{matchId: '123456'}, {matchId: '7891011'}]
    };
    const actual = mapNLPEventToPredictions(nlpEvent);
    const expected = [
      {sctid: '123456', confidence: 0.50},
      {sctid: '7891011', confidence: 0.50},
    ];
    expect(actual).to.deep.equal(expected);
  });

  it('.mapStreamToPatternMatcherPredictions should return stream of predictions', marbles(m => {
    const noteStreamEvents = [
      {pipeline: 'stt', foo: 'bar'},
      {pipeline: 'nlp', matches: [{matchId: '123456'}, {matchId: '7891011'}]}
    ];
    const input$ = m.cold('-0--(1|)', noteStreamEvents);
    const actual$ = input$.pipe(mapStreamToPatternMatcherPredictions());
    const expected$ = m.cold('----(01|)', [
      {sctid: '123456', confidence: 0.50},
      {sctid: '7891011', confidence: 0.50},
    ]);
    m.expect(actual$).toBeObservable(expected$);
  }));

  it('.getElementsAndChildrenFromCodes should request objects', marbles(m => {
    const codes = ['hpi-Location'];
    const fakeElement = {
      code: 'hpi-Location',
      findingCodes: ['hpi-LocationFinding']
    };
    const fakeFinding = {
      code: 'hpi-LocationFinding',
      findingInputCodes: [{code: 'foobar'}],
    };
    const fakeFindingInput = {code: 'foobar'};
    const requestElementsByCodes = sinon.stub().returns(m.cold('-0', [{
      elements: [fakeElement],
    }]));
    const requestFindingsByCodes = sinon.stub().returns(m.cold('-0', [{
      findings: [fakeFinding],
    }], ));
    const requestFindingInputsByCodes = sinon.stub().returns(m.cold('-0', [{
      findingInputs: [fakeFindingInput]
    }]));
    const actual$ = getElementsAndChildrenFromCodes(
      codes,
      requestElementsByCodes,
      requestFindingsByCodes,
      requestFindingInputsByCodes
    );
    const expected$ = m.cold('---0', [{
      elements: [fakeElement],
      findings: [fakeFinding],
      findingInputs: [fakeFindingInput]
    }]);
    m.expect(actual$).toBeObservable(expected$);
  }));

  it('should return valid output when the pipelines generate predictions', marbles(m => {
    const noteStreamEvents = [
      {pipeline: 'stt', foo: 'bar'},
      {pipeline: 'nlp', matches: [{matchId: '123456'}, {matchId: '7891011'}]}
    ];
    const fakeOutputItems = {
      elements: [{
        code: 'hpi-Location',
        findingCodes: ['hpi-LocationFinding']
      }],
      findings: [{
        code: 'hpi-LocationFinding',
        findingInputCodes: [{code: 'foobar'}],
      }]
    };
    const input$ = m.cold('-0--(1|)', noteStreamEvents);
    const actual$ = input$.pipe(
      predictElements({exams: source$ => m.cold('--(0|)', [fakeOutputItems])})
    );
    const expected$ = m.cold('--(01|)', [
      {...fakeOutputItems.elements[0], dataType:'element',predictionStrategy:'patternMatching'},
      {...fakeOutputItems.findings[0], dataType:'finding',predictionStrategy:'patternMatching'},
    ]);
    m.expect(actual$).toBeObservable(expected$);
  }));
});
