import {expect} from 'chai';

import composeExamSection from './composeExamSection';

const elements = [
   {
    "_id": "5f7341516f44354407f24d77",
    "name": "Head Shape",
    "code": "BC-headShapeExam",
    "noteSection": "exam",
    "bodySystem": "head",
    "description": "Check for abnormal or abnormal head shape",
    "findingCodes": [
      "SNO-301318003"
    ],
    "sctid": null,
    "observableEntitySCTID": null,
    "timeCreated": "2020-09-29T14:14:41.089Z",
    "timeUpdated": "2020-09-30T20:19:40.709Z"
  },
  {
    "_id": "5f762200fe99a6f5a9c8337b",
    "name": "Head Injury",
    "code": "BC-headInjuryExam",
    "noteSection": "exam",
    "bodySystem": "head",
    "description": "Are there any injuries (bruising, lacerations, etc) to the head?",
    "findingCodes": [
      "BC-headInjuryFinding"
    ],
    "sctid": null,
    "observableEntitySCTID": null,
    "timeCreated": "2020-10-01T18:37:52.916Z",
    "timeUpdated": "2020-10-01T18:37:52.916Z"
  }
];
const findings = [
  {
    "_id": "5f734d51e8903f4dbf5b0660",
    "name": "Normal Head Shape",
    "code": "SNO-301318003",
    "elementCode": "BC-headShapeExam",
    "inputType": "boolean",
    "inputConfig": null,
    "description": null,
    "findingInputCodes": [
      "BC-normalocephalic",
      "SNO-162827004"
    ],
    "sctid": "301318003",
    "observableEntitySCTID": null,
    "timeCreated": "2020-09-29T15:05:53.194Z",
    "timeUpdated": "2020-09-29T15:10:19.473Z"
  },
  {
    "_id": "5f762319fe99a6f5a9c83381",
    "name": "injuries to head",
    "code": "BC-headInjuryFinding",
    "elementCode": "BC-headInjuryExam",
    "inputType": "select",
    "inputConfig": null,
    "description": null,
    "findingInputCodes": [
      "BC-atraumaticHead",
      "SNO-82271004"
    ],
    "sctid": null,
    "observableEntitySCTID": null,
    "timeCreated": "2020-10-01T18:42:33.978Z",
    "timeUpdated": "2020-10-01T18:42:33.978Z"
  }
];
const normalExamInputs = [
  {
    findingCode: 'SNO-301318003',
    findingInputCodes: ['BC-normalocephalic'],
  },
  {
    findingCode: 'BC-headInjuryFinding',
    findingInputCodes: ['BC-atraumaticHead'],
  }
];
const abnormalExamInputs = [
  {
    findingCode: 'SNO-301318003',
    findingInputCodes: ['SNO-162827004'],
  },
  {
    findingCode: 'BC-headInjuryFinding',
    findingInputCodes: ['SNO-82271004'],
  }
];

describe('composeExamSection', () => {
  it('should correctly compose normal head exam bullet', () => {
    const params = {
      elements,
      findings,
      verifiedFindings: normalExamInputs,
    };
    const section = composeExamSection(params);
    expect(section).to.deep.equal({
      bullets: [
        {subtitle: 'Head', body: 'normalocephalic, atraumatic'},
      ],
      paragraphs: [],
    });
  });

  it('should correctly compose abnormal head exam bullet', () => {
    const params = {
      elements,
      findings,
      verifiedFindings: abnormalExamInputs,
    };
    const section = composeExamSection(params);
    expect(section).to.deep.equal({
      bullets: [
        {subtitle: 'Head', body: 'abnormal head shape, head injury'}
      ],
      paragraphs: [],
    });
  });
});
