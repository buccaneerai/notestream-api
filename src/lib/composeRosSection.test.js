const {expect} = require('chai');

const composeRosSection = require('./composeRosSection');

const fakeElements = [
  {
    "_id": "5fa809f80c55894296c018f2",
    "name": "eye pain",
    "code": "BC-eyePain",
    "noteSection": "ros",
    "bodySystem": "eyes",
    "description": null,
    "findingCodes": ["BC-eyePain-finding"],
    "sctid": null,
    "observableEntitySCTID": null,
    "timeCreated": "2020-11-08T15:08:40.555Z",
    "timeUpdated": "2020-11-08T15:08:40.555Z"
  },
  {
    "_id": "5fa809ec0c55894296c018f1",
    "name": "vision loss",
    "code": "BC-visionLoss",
    "noteSection": "ros",
    "bodySystem": "eyes",
    "description": null,
    "findingCodes": [
      "BC-visionLoss-finding"
    ],
    "sctid": null,
    "observableEntitySCTID": null,
    "timeCreated": "2020-11-08T15:08:28.100Z",
    "timeUpdated": "2020-12-28T20:48:40.767Z"
  },
  {
    "_id": "5fa80a040c55894296c018f3",
    "name": "blurred vision",
    "code": "BC-blurryVision",
    "noteSection": "ros",
    "bodySystem": "eyes",
    "description": null,
    "findingCodes": [
      "BC-blurryVision-finding"
    ],
    "sctid": null,
    "observableEntitySCTID": null,
    "timeCreated": "2020-11-08T15:08:52.383Z",
    "timeUpdated": "2020-12-28T20:48:40.890Z"
  },
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
    "_id": "5fa80c9311ac594741f465ab",
    "name": "weakness or numbness",
    "code": "BC-weaknessOrNumbness",
    "noteSection": "ros",
    "bodySystem": "neurological",
    "description": null,
    "findingCodes": [
      "BC-weaknessOrNumbness-finding"
    ],
    "sctid": null,
    "observableEntitySCTID": null,
    "timeCreated": "2020-11-08T15:19:47.840Z",
    "timeUpdated": "2020-12-28T20:48:40.848Z"
  },
];

const fakeFindings = [
  {
    "_id": "5fea44a8fa0e464e55082af9",
    "name": "eye pain",
    "code": "BC-eyePain-finding",
    "elementCode": "BC-eyePain",
    "inputType": "presentOrNot",
    "inputConfig": null,
    "description": null,
    "findingInputCodes": [],
    "sctid": null,
    "observableEntitySCTID": null,
    "timeCreated": "2020-12-28T20:48:40.669Z",
    "timeUpdated": "2020-12-28T20:48:40.669Z"
  },
  {
    "_id": "5fea44a8fa0e464e55082af6",
    "name": "vision loss",
    "code": "BC-visionLoss-finding",
    "elementCode": "BC-visionLoss",
    "inputType": "presentOrNot",
    "inputConfig": null,
    "description": null,
    "findingInputCodes": [],
    "sctid": null,
    "observableEntitySCTID": null,
    "timeCreated": "2020-12-28T20:48:40.666Z",
    "timeUpdated": "2020-12-28T20:48:40.666Z"
  },
  {
    "_id": "5fea44a8fa0e464e55082afe",
    "name": "blurred vision",
    "code": "BC-blurryVision-finding",
    "elementCode": "BC-blurryVision",
    "inputType": "presentOrNot",
    "inputConfig": null,
    "description": null,
    "findingInputCodes": [],
    "sctid": null,
    "observableEntitySCTID": null,
    "timeCreated": "2020-12-28T20:48:40.715Z",
    "timeUpdated": "2020-12-28T20:48:40.716Z"
  },
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
    "_id": "5fea44a8fa0e464e55082b04",
    "name": "weakness or numbness",
    "code": "BC-weaknessOrNumbness-finding",
    "elementCode": "BC-weaknessOrNumbness",
    "inputType": "presentOrNot",
    "inputConfig": null,
    "description": null,
    "findingInputCodes": [],
    "sctid": null,
    "observableEntitySCTID": null,
    "timeCreated": "2020-12-28T20:48:40.728Z",
    "timeUpdated": "2020-12-28T20:48:40.728Z"
  }
];

const fakeVerifiedFindings = [
  {
    "_id": "5f7dff889889b02093d729fa",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-eyePain-finding",
    "findingInputCodes": [],
    "findingInputValues": [
      "false"
    ],
    "timeCreated": "2020-10-07T17:48:56.669Z",
    "timeUpdated": "2020-10-07T19:54:44.031Z"
  },
  {
    "_id": "5f7e1b8f9889b02093d729fc",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-visionLoss-finding",
    "findingInputCodes": [],
    "findingInputValues": [
      "false"
    ],
    "timeCreated": "2020-10-07T19:48:31.561Z",
    "timeUpdated": "2020-10-07T19:53:12.381Z"
  },
  {
    "_id": "5fa9e2c3e0761e17bb93f16b",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-blurryVision-finding",
    "findingInputCodes": [],
    "findingInputValues": [
      "false"
    ],
    "timeCreated": "2020-11-10T00:45:55.169Z",
    "timeUpdated": "2020-11-10T00:45:55.169Z"
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
    "_id": "5fa9e2c9e0761e17bb93f16d",
    "encounterId": "5f7b62bd417785727fc5476c",
    "findingCode": "BC-weaknessOrNumbness-finding",
    "findingInputCodes": [],
    "findingInputValues": [
      "false"
    ],
    "timeCreated": "2020-11-10T00:46:01.728Z",
    "timeUpdated": "2020-11-10T00:46:01.728Z"
  },
];

describe('composeRosSection', () => {
  it('should return correct bullets when given valid inputs', () => {
    const params = {
      elements: fakeElements,
      findings: fakeFindings,
      verifiedFindings: fakeVerifiedFindings,
    };
    const actual = composeRosSection(params);
    const expected = {
      bullets: [
        {
          subtitle: 'Eyes',
          body: 'No eye pain, vision loss, blurred vision.',
        },
        {
          subtitle: 'ENT',
          body: 'Positive for rhinorrhea.'
        },
        {
          subtitle: 'Neuro',
          body: 'No weakness or numbness.',
        }
      ],
      paragraphs: [],
    };
    expect(actual).to.deep.equal(expected);
  });

  it('should filter data that is not ROS-related', () => {
    const params = {
      elements: [
        ...fakeElements,
        {noteSection: 'exam', code: 'BC-pupil-equality', bodySystem: 'eyes'},
      ],
      findings: [
        ...fakeFindings,
        {elementCode: 'BC-pupil-equality', code: 'BC-pupilEquality-finding'}
      ],
      verifiedFindings: [
        ...fakeVerifiedFindings,
        {findingCode: 'BC-pupilEquality-finding', findingInputValues: ['true']}
      ]
    };
    const actual = composeRosSection(params);
    const expected = {
      bullets: [
        {
          subtitle: 'Eyes',
          body: 'No eye pain, vision loss, blurred vision.',
        },
        {
          subtitle: 'ENT',
          body: 'Positive for rhinorrhea.'
        },
        {
          subtitle: 'Neuro',
          body: 'No weakness or numbness.',
        }
      ],
      paragraphs: [],
    };
    expect(actual).to.deep.equal(expected);
  });

  it('should handle case where there are no ROS findings', () => {
    const params = {
      elements: [
        ...fakeElements,
        {noteSection: 'exam', code: 'BC-pupil-equality', bodySystem: 'eyes'},
      ],
      findings: [
        ...fakeFindings,
        {elementCode: 'BC-pupil-equality', code: 'BC-pupilEquality-finding'}
      ],
      verifiedFindings: []
    };
    const actual = composeRosSection(params);
    const expected = {
      bullets: [],
      paragraphs: [],
    };
    expect(actual).to.deep.equal(expected);
  });
});
