const _ = require('lodash');
// import fp = require('lodash/fp';
const { of, merge, timer, zip } = require('rxjs');
const { filter, map, mergeMap, share } = require('rxjs/operators');

const trace = require('./trace');
const predictROSElements = require('./predictROSElements');
const predictPFSHElements = require('./predictPFSHElements');
const graphQLRequest = require('../ws/graphQLRequest');

const fakeExamCodes = [
  'BC-headShapeExam',
  'BC-headInjuryExam',
  'BC-eyePupilEqualityExam',
  'BC-eyePupilReactionExam',
  'BC-eyePupilSizeExam',
  'BC-eyePupilShapeExam',
  'BC-eyeScleraColorExam',
];

const fakeHpiCodes = [
  'BC-hpiLocation',
  'SNO-162465004',
  'SNO-162442009',
  'BC-hpiQuality',
  'SNO-162451001',
  'SNO-162473008',
  'SNO-162483007',
  'SNO-102483000',
];

const requestElementsByCodes = codes =>
  graphQLRequest(
    `
    query vars($filter: elementFilter) {
      elements (filter:$filter) {
        _id
        code
        bodySystem
        noteSection
        name
        description
        findingCodes
      }
    }
  `,
    { filter: { codes } }
  );

const requestFindingsByCodes = codes =>
  graphQLRequest(
    `
    query vars($filter: findingFilter) {
      findings (filter:$filter) {
        _id
        code
        name
        description
        inputType
        inputConfig {step, max, min}
        findingInputCodes
      }
    }
  `,
    { filter: { codes } }
  );

const requestFindingInputsByCodes = codes =>
  graphQLRequest(
    `
    query vars($filter: findingInputFilter) {
      findingInputs (filter:$filter) {
        _id
        code
        label
        value
        isNormal
      }
    }
  `,
    { filter: { codes } }
  );

const getElementsAndChildrenFromCodes = (
  codes,
  _requestElementsByCodes = requestElementsByCodes,
  _requestFindingsByCodes = requestFindingsByCodes,
  _requestFindingInputsByCodes = requestFindingInputsByCodes
) =>
  of(codes).pipe(
    // trace('0'),
    mergeMap(codeList =>
      _.isArray(codeList)
        ? // FIXME: - this has a timer to allow the demo to connect to Mongo
          // before it sends the graphQL requests
          timer(3000).pipe(() => _requestElementsByCodes(codeList))
        : timer(3000).pipe(() => _requestElementsByCodes([codeList]))
    ),
    // trace('1'),
    map(e => ({ ...e, findingCodes: e.findingCodes || [] })),
    // get all of the findings
    // trace('2'),
    mergeMap(({ elements }) =>
      zip(
        of(elements),
        _requestFindingsByCodes(elements.flatMap(e => e.findingCodes))
      )
    ),
    // trace('3'),
    map(([elements, { findings }]) => [
      elements,
      (
        _.isArray(findings)
        ? findings.map(f => ({
          ...f,
          findingInputCodes: f.findingInputCodes || []
        }))
        : []
      ),
    ]),
    // trace('4'),
    // get all of the finding inputs
    mergeMap(([elements, findings]) =>
      zip(
        of(elements),
        of(findings),
        _requestFindingInputsByCodes(findings.flatMap(f => f.findingInputCodes))
      )
    ),
    // trace('5'),
    map(([elements, findings, { findingInputs }]) => ({
      elements,
      findings,
      findingInputs,
    }))
  );

const defaultPipelines = {
  // Subjective
  hpi: () => getElementsAndChildrenFromCodes(fakeHpiCodes),
  ros: predictROSElements(),
  pfsh: predictPFSHElements(),
  // Objective
  exam: () => getElementsAndChildrenFromCodes(fakeExamCodes),
};

const mapElementDataToOutputEvents = ({ elements, findings, findingInputs }) => {
  const out = {
    elements: (
      _.isArray(elements)
      ? elements.map(element => ({
        ...element,
        dataType: 'element',
        predictionStrategy: 'patternMatching',
      }))
      : []
    ),
    findings: (
      _.isArray(findings)
      ? findings.map(finding => ({
        ...finding,
        dataType: 'finding',
        predictionStrategy: 'patternMatching',
      }))
      : []
    ),
    findingInputs: (
      _.isArray(findingInputs)
      ? findingInputs.map(input => ({
        ...input,
        dataType: 'findingInput',
        predictionStrategy: 'patternMatching',
      }))
      : []
    ),
  };
  return out;
};

const matchIsSNOMED = match =>
  _.isString(match.matchId) && !_.isNaN(parseInt(match.matchId.slice(0, 1), 10));

const mapPatternMatchToPrediction = match => ({
  sctid: match.matchId,
  confidence: 0.5,
});

const mapNLPEventToPredictions = nlpEvent =>
  nlpEvent && _.isArray(nlpEvent.matches) && nlpEvent.matches.length
    ? nlpEvent.matches
      .filter(matchIsSNOMED) // only include SNOMED concepts
      .map(mapPatternMatchToPrediction)
    : [];

// takes an observable noteStream events and returns the 'patternMatching'
// predictions using the NLP pattern matching strategy
const mapStreamToPatternMatcherPredictions = () => noteStreamEvent$ =>
  noteStreamEvent$.pipe(
    filter(e => e.pipeline === 'nlp'),
    trace('patternMatcher.in'),
    map(mapNLPEventToPredictions),
    mergeMap(predictions => of(...predictions)),
    trace('patternMatcher.out')
  );

// This function takes input data from STT/NLP/etc and maps it into
// predictions concerning what the physician's intent was (the medical
// actions the doctor performed).
const predictElements = (pipelines = defaultPipelines) => noteStreamEvent$ => {
  // Predictions look like: {sctid:String, confidence:Number}
  const patternMatcherPrediction$ = noteStreamEvent$.pipe(
    mapStreamToPatternMatcherPredictions()
  );
  const predictionPipelines = [patternMatcherPrediction$];
  // there will be additional sources of predictions in the near future...
  const predictions$ = merge(...predictionPipelines).pipe(share());
  // generate the output streams for each pipeline
  const intentPipelines = Object.values(pipelines).map(operator =>
    predictions$.pipe(
      operator,
      map(mapElementDataToOutputEvents),
      map(({ elements, findings, findingInputs }) => [
        ...elements,
        ...findings,
        ...findingInputs
      ]),
      mergeMap(items => of(...items))
    )
  );
  const intent$ = merge(...intentPipelines);
  return intent$;
};


module.exports = predictElements;
module.exports.testExports = {
  matchIsSNOMED,
  mapPatternMatchToPrediction,
  mapNLPEventToPredictions,
  mapStreamToPatternMatcherPredictions,
  getElementsAndChildrenFromCodes,
};
