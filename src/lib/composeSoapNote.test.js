import {expect} from 'chai';

import composeSoapNote from './composeSoapNote';

const fakeElements = [
  {
    "_id": "5fa80a6c0c55894296c018f6",
    "name": "rhinorrhea",
    "code": "BC-rhinorrhea",
    "noteSection": "ros",
    "bodySystem": "ent",
    "description": null,
    "findingCodes": ["BC-rhinorrhea-finding"],
    "sctid": null,
    "observableEntitySCTID": null,
    "timeCreated": "2020-11-08T15:10:36.533Z",
    "timeUpdated": "2020-11-08T15:10:36.533Z"
  },
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
];

const fakeFindings = [
  {
    "_id": "5fea44a8fa0e464e55082aff",
    "name": "rhinorrhea",
    "code": "BC-rhinorrhea-finding",
    "elementCode": "BC-rhinorrhea",
    "inputType": "presentOrNot",
    "inputConfig": null,
    "description": null,
    "findingInputCodes": [],
    "sctid": null,
    "observableEntitySCTID": null,
    "timeCreated": "2020-12-28T20:48:40.724Z",
    "timeUpdated": "2020-12-28T20:48:40.724Z"
  },
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
];

const fakeVerifiedFindings = [
  {
    "_id": "5f7dfda99889b02093d729f7",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-hpiLocationFinding",
    "findingInputCodes": [],
    "findingInputValues": [
      "Forehead"
    ],
    "timeCreated": "2020-10-07T17:40:57.217Z",
    "timeUpdated": "2020-10-07T19:55:55.876Z"
  },
  {
    "_id": "5f7dff889889b02093d729fa",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-hpiQuality",
    "findingInputCodes": [],
    "findingInputValues": [
      "Stabbing pain"
    ],
    "timeCreated": "2020-10-07T17:48:56.669Z",
    "timeUpdated": "2020-10-07T19:54:44.031Z"
  },
  {
    "_id": "5f7e1b8f9889b02093d729fc",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-hpiSeverityScale",
    "findingInputCodes": [],
    "findingInputValues": [
      "6"
    ],
    "timeCreated": "2020-10-07T19:48:31.561Z",
    "timeUpdated": "2020-10-07T19:53:12.381Z"
  },
  {
    "_id": "5fa9e2c3e0761e17bb93f16b",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-hpiLocationString",
    "findingInputCodes": [],
    "findingInputValues": [
      "frontal, bilateral"
    ],
    "timeCreated": "2020-11-10T00:45:55.169Z",
    "timeUpdated": "2020-11-10T00:45:55.169Z"
  },
  {
    "_id": "5fa9e2c6e0761e17bb93f16c",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-hpiSeverityNumber",
    "findingInputCodes": [],
    "findingInputValues": [
      "6"
    ],
    "timeCreated": "2020-11-10T00:45:58.588Z",
    "timeUpdated": "2020-11-10T00:45:58.588Z"
  },
  {
    "_id": "5fa9e2c9e0761e17bb93f16d",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-hpiOnset",
    "findingInputCodes": [],
    "findingInputValues": [
      "this morning"
    ],
    "timeCreated": "2020-11-10T00:46:01.728Z",
    "timeUpdated": "2020-11-10T00:46:01.728Z"
  },
  {
    "_id": "5fa9e2cee0761e17bb93f16e",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-hpiQualityString",
    "findingInputCodes": [],
    "findingInputValues": [
      "throbbing"
    ],
    "timeCreated": "2020-11-10T00:46:06.334Z",
    "timeUpdated": "2020-11-10T00:46:06.334Z"
  },
  {
    "_id": "5fa9e2d0e0761e17bb93f16f",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-hpiTimingString",
    "findingInputCodes": [],
    "findingInputValues": [
      "comes and goes"
    ],
    "timeCreated": "2020-11-10T00:46:08.768Z",
    "timeUpdated": "2020-11-10T00:46:08.768Z"
  },
  {
    "_id": "5fa9e2dbe0761e17bb93f170",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-aggravatingFactorsString",
    "findingInputCodes": [],
    "findingInputValues": [
      "light and smells"
    ],
    "timeCreated": "2020-11-10T00:46:19.029Z",
    "timeUpdated": "2020-11-10T00:46:19.029Z"
  },
  {
    "_id": "5fa9e2e1e0761e17bb93f171",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-relievingFactorsString",
    "findingInputCodes": [],
    "findingInputValues": [
      "bedrest"
    ],
    "timeCreated": "2020-11-10T00:46:25.992Z",
    "timeUpdated": "2020-11-10T00:46:25.992Z"
  },
  {
    "_id": "5fa9e2e8e0761e17bb93f172",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-associatedSignsString",
    "findingInputCodes": [],
    "findingInputValues": [
      "nausea"
    ],
    "timeCreated": "2020-11-10T00:46:32.494Z",
    "timeUpdated": "2020-11-10T00:46:32.494Z"
  },
  {
    "_id": "5fa9e2c6e0761e17bb93f16c",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-rhinorrhea-finding",
    "findingInputCodes": [],
    "findingInputValues": [
      "true"
    ],
    "timeCreated": "2020-11-10T00:45:58.588Z",
    "timeUpdated": "2020-11-10T00:45:58.588Z"
  },
  {
    "encounterId": "5f7b62bd417785727fc5476c",
    findingCode: 'SNO-301318003',
    findingInputCodes: ['BC-normalocephalic'],
  },
];

const fakeProblems = [
  {'cid': '1234567', name: 'Migraine (disorder)'}
];

describe('composeSoapNote', () => {
  it('should return a valid note when given valid inputs', () => {
    const params = {
      elements: fakeElements,
      findings: fakeFindings,
      verifiedFindings: fakeVerifiedFindings,
      problems: fakeProblems,
      patientName: 'Tony Stark',
      patientAge: 40,
      patientSex: 'male',
      chiefComplaint: 'headache',
    };
    const noteSections = composeSoapNote(params);
    expect(noteSections.length).to.equal(5);
    expect(noteSections[0]).to.deep.equal({
      noteSection: 'intro',
      bullets: [],
      paragraphs: [{
        subtitle: null,
        body: 'Patient is a 40 y.o. male who presents with headache.',
      }]
    });
    expect(noteSections[1]).to.deep.equal({
      noteSection: 'hpi',
      bullets: [],
      paragraphs: [{
        subtitle: null,
        body: 'Patient complains of headache which began this morning, is 6/10 severity, is 6, comes and goes, Stabbing pain in nature, is located in Forehead and is located in frontal, bilateral. It gets better with bedrest. It gets worse with light and smells. Patient asserts nausea.',
      }]
    });
    expect(noteSections[2]).to.deep.equal({
      noteSection: 'ros',
      bullets: [{
        subtitle: 'ENT',
        body: 'Positive for rhinorrhea.',
      }],
      paragraphs: [],
    });
    expect(noteSections[3]).to.deep.equal({
      noteSection: 'exam',
      bullets: [{
        subtitle: 'Head',
        body: 'normalocephalic',
      }],
      paragraphs: [],
    });
    expect(noteSections[4]).to.deep.equal({
      noteSection: 'problems',
      bullets: [{
        subtitle: 'Migraine',
        body: '',
      }],
      paragraphs: [],
    })
  });
});
