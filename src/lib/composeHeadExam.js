const composeListString = require('./composeListString');

const parseQualifiers = values => (
  values && values[0]
  ? ` (${values[0]})`
  : ''
);

const parsers = {
  'SNO-301318003': {
    parse: (codes, values) => (
      codes[0] === 'BC-normalocephalic'
      ? 'normalocephalic'
      : `abnormal head shape${parseQualifiers(values)}`
    )
  },
  'BC-headInjuryFinding': {
    appendTosentence: true,
    multi: false,
    parse: (codes, values) => (
      codes[0] === 'BC-atraumaticHead'
      ? 'atraumatic'
      : `head injury${parseQualifiers(values)}`
    )
  },
};

const composeHeadExam = function composeHeadExam({
  findingsWithInput,
  subtitle = 'Head'
}) {
  // console.log('findings', JSON.stringify(findingsWithInput));
  const descriptors = findingsWithInput.flatMap(
    f => f.verifiedFindings.map(
      vf => parsers[f.code].parse(vf.findingInputCodes, vf.findingInputValues)
    )
  );
  const body = composeListString(descriptors);
  return {subtitle, body};
};

module.exports = composeHeadExam;
