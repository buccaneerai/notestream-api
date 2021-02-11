import composeIntroSection from './composeIntroSection';
import composeHpiSection from './composeHpiSection';
import composeRosSection from './composeRosSection';
import composeExamSection from './composeExamSection';
import composeProblemSection from './composeProblemSection';

const defaultConfig = {
  intro: {},
  hpi: {},
  ros: {},
  exam: {},
  problems: {},
};

const defaultSections = [
  'intro',
  'hpi',
  // 'pfsh',
  // 'mhx', // HL7/FHIR
  // 'shx', // HL7/FHIR
  // 'allergies', // HL7/FHIR
  // 'medications', // HL7/FHIR
  'ros',
  // 'vitals', // HL7/FHIR
  // 'labs',  // HL7/FHIR
  'exam',
  'problems',
];

const composers = {
  intro: composeIntroSection,
  hpi: composeHpiSection,
  ros: composeRosSection,
  exam: composeExamSection,
  problems: composeProblemSection,
};

// const getElementsWithChildren = (elements, findings, inputs, verifiedInputs) => (
//   elements.map(e => ({
//     ...e,
//     findings: findings
//       .filter(f => f.elementCode === e.code)
//       .map(f => ({
//         ...f,
//         inputs: inputs
//           .filter(i => i.findingCode === f.code)
//           .map(),
//         verifiedInputs: verifiedInputs.filter(i => i.findingCode === f.code),
//       }))
//   }))
// );

const composeSection = (sectionName, params, opts, _composers = composers) => ({
  noteSection: sectionName,
  ..._composers[sectionName]({...params, config: opts[sectionName]})
});

const composeSoapNote = function composeSoapNote({
  verifiedFindings = [],
  elements = [],
  findings = [],
  problems = [],
  patientName = 'REDACTED',
  patientAge = 'REDACTED',
  patientSex = 'REDACTED',
  chiefComplaint = 'ADD_CC',
  // elements,
  // findings,
  // findingInputs,
  config = {},
  _sections = defaultSections,
} = {}) {
  const options = {...defaultConfig, ...config};
  const params = {
    elements,
    findings,
    verifiedFindings,
    problems,
    patientName,
    patientAge,
    patientSex,
    chiefComplaint
  };
  // const elementsWithChildren = getElementsWithChildren(
  //   elements,
  //   findings,
  //   findingInputs,
  //   verifiedFindingInputs
  // );
  const sectionsArr = _sections.reduce((acc, sectionName) => ([
    ...acc,
    composeSection(sectionName, params, options)
  ]), []);
  return sectionsArr;
};

export default composeSoapNote;
