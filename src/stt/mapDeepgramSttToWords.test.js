const {expect} = require('chai');
const {marbles} = require('rxjs-marbles/mocha');

const mapDeepgramSttToWords = require('./mapDeepgramSttToWords');

const deepgramEvents = [{
  "channel": {
    "alternatives": [
      {
        "confidence": 0.80589044,
        "transcript": "soldiers sailors on air",
        "words": [
          {
            "confidence": 0.98063844,
            "end": 0.68,
            "start": 0.17999999,
            "word": "soldiers",
            "speaker": 0,
          },
          {
            "confidence": 0.80589044,
            "end": 1.42,
            "start": 1.06,
            "word": "sailors",
            "speaker": 0,
          },
          {
            "confidence": 0.6254763,
            "end": 1.66,
            "start": 1.42,
            "word": "on",
            "speaker": 0,
          },
          {
            "confidence": 0.38039473,
            "end": 2.047875,
            "start": 1.66,
            "word": "air",
            "speaker": 0,
          }
        ]
      }
    ]
  },
  "channel_index": [
    0,
    1
  ],
  "duration": 2.047875,
  "index": 0,
  "is_final": false,
  "start": 0
},
  {
    "channel": {
      "alternatives": [
        {
          "confidence": 0.97914654,
          "transcript": "soldiers sailors and air of the allied expedition force",
          "words": [
            {
              "confidence": 0.98453885,
              "end": 0.6786893,
              "start": 0.17868932,
              "word": "soldiers",
              "speaker": 0,
            },
            {
              "confidence": 0.7530638,
              "end": 1.4096602,
              "start": 1.0522815,
              "word": "sailors",
              "speaker": 0,
            },
            {
              "confidence": 0.8435231,
              "end": 1.6479126,
              "start": 1.4096602,
              "word": "and",
              "speaker": 0,
            },
            {
              "confidence": 0.23861745,
              "end": 2.1479125,
              "start": 1.6479126,
              "word": "air",
              "speaker": 0,
            },
            {
              "confidence": 0.887734,
              "end": 2.4023786,
              "start": 2.2832525,
              "word": "of",
              "speaker": 0,
            },
            {
              "confidence": 0.9802551,
              "end": 2.5612135,
              "start": 2.4023786,
              "word": "the",
              "speaker": 0,
            },
            {
              "confidence": 0.9982851,
              "end": 3.0612135,
              "start": 2.5612135,
              "word": "allied",
              "speaker": 0,
            },
            {
              "confidence": 0.97914654,
              "end": 3.6965535,
              "start": 3.1965535,
              "word": "expedition",
              "speaker": 0,
            },
            {
              "confidence": 0.9935487,
              "end": 4.095875,
              "start": 3.712767,
              "word": "force",
              "speaker": 0,
            }
          ]
        }
      ]
    },
    "channel_index": [
      0,
      1
    ],
    "duration": 4.095875,
    "index": 1,
    "is_final": true,
    "start": 0
  }
];

const wordsOut = [
  {
    "text": "soldiers",
    "end": 0.6786893,
    "start": 0.17868932,
    "confidence": 0.98453885,
    "speaker": 0,
    "speakerConfidence": null,
  },
  {
    "text": "sailors",
    "end": 1.4096602,
    "start": 1.0522815,
    "confidence": 0.7530638,
    "speaker": 0,
    "speakerConfidence": null,
  },
  {
    "text": "and",
    "end": 1.6479126,
    "start": 1.4096602,
    "confidence": 0.8435231,
    "speaker": 0,
    "speakerConfidence": null,
  },
  {
    "text": "air",
    "end": 2.1479125,
    "start": 1.6479126,
    "confidence": 0.23861745,
    "speaker": 0,
    "speakerConfidence": null,
  },
  {
    "text": "of",
    "end": 2.4023786,
    "start": 2.2832525,
    "confidence": 0.887734,
    "speaker": 0,
    "speakerConfidence": null,
  },
  {
    "text": "the",
    "end": 2.5612135,
    "start": 2.4023786,
    "confidence": 0.9802551,
    "speaker": 0,
    "speakerConfidence": null,
  },
  {
    "text": "allied",
    "end": 3.0612135,
    "start": 2.5612135,
    "confidence": 0.9982851,
    "speaker": 0,
    "speakerConfidence": null,
  },
  {
    "text": "expedition",
    "end": 3.6965535,
    "start": 3.1965535,
    "confidence": 0.97914654,
    "speaker": 0,
    "speakerConfidence": null,
  },
  {
    "text": "force",
    "end": 4.095875,
    "start": 3.712767,
    "confidence": 0.9935487,
    "speaker": 0,
    "speakerConfidence": null,
  },
];

describe('operators.mapDeepgramSttToWords', () => {
  it('should map deepgram events into word objects', marbles(m => {
    const input$ = m.cold('-0--(1|)', deepgramEvents);
    const actual$ = input$.pipe(mapDeepgramSttToWords());
    const expected$ = m.cold('----(012345678|)', wordsOut);
    m.expect(actual$).toBeObservable(expected$);
  }));
});
