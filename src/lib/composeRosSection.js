import get from 'lodash/get';

const bodySystems = {
  constitutional: {
    displayName: 'Constitutional',
  },
  eyes: {
    displayName: 'Eyes',
  },
  ent: {
    displayName: 'ENT',
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

const composeList = verifiedFindingsWithDisplayName => (
  verifiedFindingsWithDisplayName.reduce((acc, vf, i) => {
    if (i === 0) return vf.displayName;
    if (i === verifiedFindingsWithDisplayName.length - 1) {
      return `${acc}, ${vf.displayName}`
    }
    return `${acc}, ${vf.displayName}`;
  }, '')
);

const composeBullet = function composeBullet({
  subtitle,
  findings,
  verifiedFindings
}) {
  const verifiedFindingsWithNames = verifiedFindings.map(f => ({
    ...f,
    displayName: findings.find(finding => finding.code === f.findingCode).name,
  }));
  const positives = verifiedFindingsWithNames.filter(
    f => f.findingInputValues[0] === 'true'
  );
  const negatives = verifiedFindingsWithNames.filter(
    f => f.findingInputValues[0] === 'false'
  );
  const positivesStr = (
    positives.length
    ? `Positive for ${composeList(positives)}.`
    : ''
  );
  const negativesStr = (
    negatives.length
    ? `No ${composeList(negatives)}.`
    : ''
  );
  const body = `${positivesStr}${positivesStr ? ' ' : ''}${negativesStr}`
    .replace(/^\s/, '')
    .replace(/\s$/, '');
  return {subtitle, body};
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
      const findingCodes = systemFindings.map(f => f.code);
      const systemVerifiedFindings = verifiedFindings.filter(vf =>
        findingCodes.includes(vf.findingCode)
      );
      return composeBullet({
        subtitle: _bodySystems[bodySystem].displayName,
        findings: systemFindings,
        verifiedFindings: systemVerifiedFindings,
      });
    })
    .filter(bullet => bullet.body);
  return {bullets, paragraphs: []};
};

const variantComposers = {
  bullets: composeBullets,
};

const composeRosSection = function composeRosSection({
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
    elements: elements.filter(e => e.noteSection === 'ros')
  });
  return data;
};

export default composeRosSection;
