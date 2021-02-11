import get from 'lodash/get';
import sortBy from 'lodash/sortBy';

const errors = {
  noParser: code => new Error(`no parser for HPI code: ${code}`),
};

const getParentCode = verifiedFinding => get(
  verifiedFinding,
  'findingInputCodes[0]',
  verifiedFinding.findingCode
);

const appendSubElements = values => values.reduce((acc, next, index) => {
  if (index === 0) return next;
  if (index === values.length - 1) return `${acc} and ${next}`;
  return `${acc}, ${next}`;
}, '');

const parsers = {
  'BC-hpiOnset': {
    appendToSentence: true,
    multi: false,
    parse: value => `began ${value}`,
  },
  'BC-hpiSeverityNumber': {
    appendToSentence: true,
    multi: false,
    parse: values => `is ${values[0]}/10 severity`,
  },
  'BC-hpiSeverityScale': {
    appendToSentence: true,
    multi: false,
    parse: values => `is ${values[0]}`,
  },
  'BC-hpiTimingString': {
    appendToSentence: true,
    multi: true,
    parse: values => appendSubElements(values),
  },
  'BC-hpiQuality': {
    findingInputcode: '',
    appendToSentence: true,
    multi: true,
    parse: values => `${appendSubElements(values)} in nature`,
  },
  'BC-hpiLocationFinding': {
    appendToSentence: true,
    multi: true,
    parse: values => `is located in ${appendSubElements(values)}`,
  },
  'BC-hpiLocationString': {
    appendToSentence: true,
    multi: true,
    parse: values => `is located in ${appendSubElements(values)}`,
  },
  'BC-relievingFactorsString': {
    appendToSentence: false,
    multi: true,
    parse: values => `It gets better with ${appendSubElements(values)}.`,
  },
  'BC-aggravatingFactorsString': {
    appendToSentence: false,
    multi: true,
    parse: values => `It gets worse with ${appendSubElements(values)}.`,
  },
  'BC-associatedSignsString': {
    appendToSentence: false,
    multi: true,
    parse: values => `Patient asserts ${appendSubElements(values)}.`,
  },
  'BC-hpiContext': {
    appendToSentence: false,
    multi: false,
    parse: value => value,
  },
};

const sortFindings = (order = Object.keys(parsers)) => verifiedFindings => (
  sortBy(verifiedFindings, vf => order.indexOf(getParentCode(vf)))
);

const descriptorReducer = (_parsers = parsers) => (
  (acc, verifiedFinding, index, arr) => {
    const parentCode = getParentCode(verifiedFinding);
    const values = verifiedFinding.findingInputValues;
    const parser = _parsers[parentCode];
    if (!parser) {
      console.log(errors.noParser(parentCode));
      return acc;
    }
    const appendsPriorDescriptor = (
      acc.appendsPriorDescriptor
      ? acc.appendsPriorDescriptor
      : parser.appendToSentence
    );
    if (acc.appendsPriorDescriptor && index < arr.length - 1) {
      return {
        ...acc,
        appendsPriorDescriptor,
        body: `${acc.body}, ${parser.parse(values)}`
      };
    }
    if (acc.appendsPriorDescriptor && index === arr.length - 1) {
      return {
        ...acc,
        appendsPriorDescriptor,
        body: `${acc.body} and ${parser.parse(values)}.`
      };
    }
    return {
      ...acc,
      appendsPriorDescriptor,
      body: `${acc.body} ${parser.parse(values)}`
    };
  }
);

const sentencesReducer = (_parsers = parsers) => (acc, verifiedFinding) => {
  const parentCode = getParentCode(verifiedFinding);
  const values = verifiedFinding.findingInputValues;
  const parser = _parsers[parentCode];
  if (!parser) {
    console.log(errors.noParser(parentCode));
    return acc;
  }
  return `${acc} ${parser.parse(values)}`;
};

const composeHpiParagraph = ({chiefComplaint, verifiedFindings}) => {
  const intro = `Patient complains of ${chiefComplaint} which`;
  const descriptorFindings = verifiedFindings.filter(vf =>
    get(parsers, `[${getParentCode(vf)}].appendToSentence`, false)
  );
  const sentenceFindings = verifiedFindings.filter(vf =>
    !get(parsers, `[${getParentCode(vf)}].appendToSentence`, true)
  );
  const firstSentence = descriptorFindings.reduce(
    descriptorReducer(),
    {body: intro, appendsPriorDescriptor: false}
  ).body;
  const sentences = sentenceFindings.reduce(
    sentencesReducer(),
    ''
  );
  const paragraph = `${firstSentence}${sentences}`;
  return {paragraphs: [{body: paragraph, subtitle: null}], bullets: []};
};

const variantComposers = {
  paragraph: composeHpiParagraph,
};

const composeHpiSection = ({
  verifiedFindings,
  chiefComplaint,
  config = {variant: 'paragraph'},
  _composers = variantComposers
}) => {
  const variant = get(config, 'variant', 'paragraph');
  const data = _composers[variant]({
    verifiedFindings: sortFindings()(verifiedFindings),
    chiefComplaint
  });
  return data;
};

export default composeHpiSection;
