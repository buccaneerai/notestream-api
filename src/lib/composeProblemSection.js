import get from 'lodash/get';

// remove SNOMED qualifiers like ' (finding)', ' (disorder)', etc...
const prettyName = ({name}) => name.replace(/\s\(.*\)$/, '');

const composeBullets = ({problems}) => {
  const bullets = problems.map(problem => ({
    subtitle: prettyName(problem),
    body: '',
  }));
  return {bullets, paragraphs: []};
};

const variantComposers = {
  bullets: composeBullets,
};

const composeProblemSection = function composeProblemSection({
  problems,
  config = {variant: 'bullets'},
  _composers = variantComposers
}) {
  const variant = get(config, 'variant', 'bullets');
  const section = _composers[variant]({problems});
  return section;
};

export default composeProblemSection;
