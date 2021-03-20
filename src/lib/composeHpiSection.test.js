const {expect} = require('chai');

const composeHpiSection = require('./composeHpiSection');

const fakeVerifiedFindings = [
  {
    "_id": "5f7dff889889b02093d729fa",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-hpiQuality",
    "findingInputCodes": [],
    "findingInputValues": [
      "stabbing"
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
      "severe"
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
      "forehead"
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
      "comes-and-goes"
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
      "light", "smells", "movement"
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
  }
];

describe('composeHpiSection', () => {
  it('should return correct paragraph when given valid inputs', () => {
    const params = {
      verifiedFindings: fakeVerifiedFindings,
      chiefComplaint: 'headache',
    };
    const actual = composeHpiSection(params);
    const expected = {
      paragraphs: [{
        subtitle: null,
        body: 'Patient complains of headache which began this morning, is 6/10 severity, is severe, comes-and-goes, stabbing in nature and is located in forehead. It gets better with bedrest. It gets worse with light, smells and movement. Patient asserts nausea.',
      }],
      bullets: [],
    };
    expect(actual).to.deep.equal(expected);
  });
});
