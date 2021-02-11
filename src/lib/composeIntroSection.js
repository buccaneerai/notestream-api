const defaultConfig = {
  showName: false,
  maskAge: true,
  variant: 'presentsWith',
};

const composeIntroSection = ({
  patientName,
  patientAge,
  patientSex,
  chiefComplaint,
  config = {},
}) => {
  const conf = {...defaultConfig, ...config};
  const patientMoniker = conf.showName ? patientName : 'Patient';
  const presentedAge = conf.maskAge && patientAge > 89 ? '90+' : patientAge;
  let paragraph = `${patientMoniker} is a ${presentedAge} y.o. ${patientSex}`;
  if (conf.variant === 'presentsWith') {
    paragraph += ` who presents with ${chiefComplaint}.`;
  }
  return {paragraphs: [{body: paragraph, subtitle: null}], bullets: []};
};

export default composeIntroSection;
