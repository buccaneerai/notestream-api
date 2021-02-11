import {expect} from 'chai';

import composeIntroSection from './composeIntroSection';

describe('composeIntroSection', () => {
  it('should return a correct paragraph when given valid input', () => {
    const params = {
      patientName: 'Tony Stark',
      patientAge: 40,
      patientSex: 'male',
      chiefComplaint: 'a headache',
    };
    const actual = composeIntroSection(params);
    const expected = {
      paragraphs: [
        {
          body: 'Patient is a 40 y.o. male who presents with a headache.',
          subtitle: null,
        }
      ],
      bullets: [],
    };
    expect(actual).to.deep.equal(expected);
  });

  it('should show patient name if showName is set to true', () => {
    const params = {
      patientName: 'Tony Stark',
      patientAge: 40,
      patientSex: 'male',
      chiefComplaint: 'a headache',
      config: {showName: true},
    };
    const actual = composeIntroSection(params);
    const expected = {
      paragraphs: [
        {
          body: 'Tony Stark is a 40 y.o. male who presents with a headache.',
          subtitle: null,
        }
      ],
      bullets: [],
    };
    expect(actual).to.deep.equal(expected);
  });

  it('should mask patient age by default if age is over 90 (for HIPAA de-identification)', () => {
    const params = {
      patientName: 'Tony Stark',
      patientAge: 90,
      patientSex: 'male',
      chiefComplaint: 'a headache',
      config: {showName: true},
    };
    const actual = composeIntroSection(params);
    const expected = {
      paragraphs: [
        {
          body: 'Tony Stark is a 90+ y.o. male who presents with a headache.',
          subtitle: null,
        }
      ],
      bullets: [],
    };
    expect(actual).to.deep.equal(expected);
  });

  it('should unmask patient age if maskAge is set to false', () => {
    const params = {
      patientName: 'Tony Stark',
      patientAge: 91,
      patientSex: 'male',
      chiefComplaint: 'a headache',
      config: {showName: true, maskAge: false},
    };
    const actual = composeIntroSection(params);
    const expected = {
      paragraphs: [
        {
          body: 'Tony Stark is a 91 y.o. male who presents with a headache.',
          subtitle: null,
        }
      ],
      bullets: [],
    };
    expect(actual).to.deep.equal(expected);
  });
});
