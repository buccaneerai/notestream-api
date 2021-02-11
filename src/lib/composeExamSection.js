import get from 'lodash/get';

import composeHeadExam from './composeHeadExam';

const bodySystems = {
  constitutional: {
    displayName: 'Constitutional',
  },
  head: {
    displayName: 'Head',
    composer: composeHeadExam,
  },
  eyes: {
    displayName: 'Eyes',
  },
  ears: {
    displayName: 'Ears'
  },
  nose: {
    displayName: 'Nose',
  },
  throat: {
    displayName: 'Throat & Mouth',
  },
  neck: {
    displayName: 'Neck',
  },
  breasts: {
    displayName: 'Breasts',
  },
  cardiovascalar: {
    displayName: 'CV',
  },
  respiratory: {
    displayName: 'Respiratory',
  },
  integumetory: {
    displayName: 'IG',
  },
  neurological: {
    displayName: 'Neuro',
  },
  gastrointestinal: {
    displayName: 'GI',
  },
  psychiatric: {
    displayName: 'Psychiatric',
  },
  musculoskeletal: {
    displayName: 'MSK',
  },
  genitourinary: {
    displayName: 'GU',
  },
};

const composeBullet = function composeBullet({
  subtitle,
  bodySystem,
  findingsWithInput,
  _bodySystems = bodySystems
}) {
  const bullet = _bodySystems[bodySystem].composer({subtitle, findingsWithInput});
  return bullet;
};

const composeBullets = function composeBullets({
  elements,
  findings,
  verifiedFindings,
  _bodySystems = bodySystems
}) {
  const bullets = Object.keys(_bodySystems)
    .filter(bodySystem => elements.find(e => e.bodySystem === bodySystem))
    .map(bodySystem => {
      const systemElements = elements.filter(e => e.bodySystem === bodySystem);
      const elementCodes = systemElements.map(e => e.code);
      const systemFindings = findings.filter(f =>
        elementCodes.includes(f.elementCode)
      );
      const findingsWithInput = systemFindings.map(f => ({
        ...f,
        verifiedFindings: verifiedFindings.filter(vf => vf.findingCode === f.code)
      }));
      return composeBullet({
        bodySystem,
        findingsWithInput,
        subtitle: _bodySystems[bodySystem].displayName,
      });
    })
    .filter(bullet => bullet.body);
  return {bullets, paragraphs: []};
};

const variantComposers = {
  bullets: composeBullets,
};

const composeExamSection = function composeExamSection({
  elements,
  findings,
  verifiedFindings,
  config = {variant: 'bullets'},
  _composers = variantComposers
}) {
  const variant = get(config, 'variant', 'bullets');
  const data = _composers[variant]({
    findings,
    verifiedFindings,
    elements: elements.filter(e => e.noteSection === 'exam')
  });
  return data;
};

export default composeExamSection;
