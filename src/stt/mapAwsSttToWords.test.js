const {expect} = require('chai');
const {marbles} = require('rxjs-marbles/mocha');

const mapAwsSttToWords = require('./mapAwsSttToWords');

const awsEvents = [
  {
    "Transcript": {
      "Results": []
    },
    "index": 3
  },
  {
    "Transcript": {
      "Results": [
        {
          "Alternatives": [
            {
              "Items": [
                {
                  "Content": "So",
                  "EndTime": 0.16,
                  "StartTime": 0.09,
                  "Type": "pronunciation",
                  "VocabularyFilterMatch": false
                }
              ],
              "Transcript": "So"
            }
          ],
          "EndTime": 0.2,
          "IsPartial": true,
          "ResultId": "166dc762-ac04-4bf9-b646-11525f6f190f",
          "StartTime": 0.09
        }
      ]
    },
    "index": 4
  },
  {
    "Transcript": {
      "Results": [
        {
          "Alternatives": [
            {
              "Items": [
                {
                  "Content": "Soldiers",
                  "EndTime": 0.75,
                  "StartTime": 0.09,
                  "Type": "pronunciation",
                  "VocabularyFilterMatch": false
                },
                {
                  "Content": ",",
                  "EndTime": 0.75,
                  "StartTime": 0.75,
                  "Type": "punctuation",
                  "VocabularyFilterMatch": false
                },
                {
                  "Content": "sailors",
                  "EndTime": 1.39,
                  "StartTime": 0.86,
                  "Type": "pronunciation",
                  "VocabularyFilterMatch": false
                },
                {
                  "Content": "and",
                  "EndTime": 1.53,
                  "StartTime": 1.4,
                  "Type": "pronunciation",
                  "VocabularyFilterMatch": false
                },
                {
                  "Content": "airmen",
                  "EndTime": 2,
                  "StartTime": 1.55,
                  "Type": "pronunciation",
                  "VocabularyFilterMatch": false
                },
                {
                  "Content": "of",
                  "EndTime": 2.38,
                  "StartTime": 2.21,
                  "Type": "pronunciation",
                  "VocabularyFilterMatch": false
                },
                {
                  "Content": "the",
                  "EndTime": 2.54,
                  "StartTime": 2.39,
                  "Type": "pronunciation",
                  "VocabularyFilterMatch": false
                },
                {
                  "Content": "Allied",
                  "EndTime": 2.87,
                  "StartTime": 2.55,
                  "Type": "pronunciation",
                  "VocabularyFilterMatch": false
                },
                {
                  "Content": "Expeditionary",
                  "EndTime": 3.65,
                  "StartTime": 2.89,
                  "Type": "pronunciation",
                  "VocabularyFilterMatch": false
                }
              ],
              "Transcript": "Soldiers, sailors and airmen of the Allied Expeditionary Force."
            }
          ],
          "EndTime": 4.27,
          "IsPartial": false,
          "ResultId": "166dc762-ac04-4bf9-b646-11525f6f190f",
          "StartTime": 0.09
        }
      ]
    },
    "index": 25
  }
];

const wordsOut = [
  {
    "confidence": null,
    "end": 0.75,
    "start": 0.09,
    "text": "Soldiers",
    "speaker": null,
    "speakerConfidence": null,
  },
  {
    "confidence": null,
    "end": 0.75,
    "start": 0.75,
    "text": ",",
    "speaker": null,
    "speakerConfidence": null,
  },
  {
    "confidence": null,
    "end": 1.39,
    "start": 0.86,
    "text": "sailors",
    "speaker": null,
    "speakerConfidence": null,
  },
  {
    "confidence": null,
    "end": 1.53,
    "start": 1.4,
    "text": "and",
    "speaker": null,
    "speakerConfidence": null,
  },
  {
    "confidence": null,
    "end": 2,
    "start": 1.55,
    "text": "airmen",
    "speaker": null,
    "speakerConfidence": null,
  },
  {
    "confidence": null,
    "end": 2.38,
    "start": 2.21,
    "text": "of",
    "speaker": null,
    "speakerConfidence": null,
  },
  {
    "confidence": null,
    "end": 2.54,
    "start": 2.39,
    "text": "the",
    "speaker": null,
    "speakerConfidence": null,
  },
  {
    "confidence": null,
    "end": 2.87,
    "start": 2.55,
    "text": "Allied",
    "speaker": null,
    "speakerConfidence": null,
  },
  {
    "confidence": null,
    "end": 3.65,
    "start": 2.89,
    "text": "Expeditionary",
    "speaker": null,
    "speakerConfidence": null,
  }
];

describe('operators.mapAwsSttToWords', () => {
  it('should map events into word objects', marbles(m => {
    const input$ = m.cold('-01-(2|)', awsEvents);
    const actual$ = input$.pipe(mapAwsSttToWords());
    const expected$ = m.cold('----(012345678|)', wordsOut);
    m.expect(actual$).toBeObservable(expected$);
  }));
});
