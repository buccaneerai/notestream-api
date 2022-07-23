const {expect} = require('chai');

const composeProblemSection = require('./composeProblemSection');

describe('composeProblemSection', () => {
  it('should correctly compose problem section bullets', () => {
    const problems = [
      {name: 'Hyperlipidemia'},
      {name: 'Abdominal pain'},
      {name: 'Simple obesity'},
      {name: 'Migraine (disorder)'},
      {name: 'Fatigue (finding)'},
    ];
    const params = {problems};
    const output = composeProblemSection(params);
    expect(output).to.deep.equal({
      bullets: [
        {subtitle: 'Hyperlipidemia', body: ''},
        {subtitle: 'Abdominal pain', body: ''},
        {subtitle: 'Simple obesity', body: ''},
        {subtitle: 'Migraine', body: ''},
        {subtitle: 'Fatigue', body: ''},
      ],
      paragraphs: []
    });
  });
});
