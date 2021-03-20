import {expect} from 'chai';
import {marbles} from 'rxjs-marbles/mocha';

import mapDeepSpeechSttToWords from './mapDeepSpeechSttToWords';

const deepspeechEvents = [
  {
    "index": 0,
    "transcripts": [
      {
        "confidence": -69.76224517822266,
        "words": [
          {
            "endTime": 1.0399999618530273,
            "startTime": 0.019999999552965164,
            "text": "soldiers"
          },
          {
            "endTime": 1.459999918937683,
            "startTime": 1.059999942779541,
            "text": "sailors"
          },
          {
            "endTime": 1.6200000047683716,
            "startTime": 1.4800000190734863,
            "text": "and"
          },
          {
            "endTime": 2.1599998474121094,
            "startTime": 1.659999966621399,
            "text": "airmen"
          },
          {
            "endTime": 2.5,
            "startTime": 2.3399999141693115,
            "text": "of"
          },
          {
            "endTime": 2.619999885559082,
            "startTime": 2.5199999809265137,
            "text": "the"
          },
          {
            "endTime": 2.9600000381469727,
            "startTime": 2.6599998474121094,
            "text": "allied"
          },
          {
            "endTime": 3.679999828338623,
            "startTime": 2.9800000190734863,
            "text": "expeditionary"
          },
          {
            "endTime": 4.079999923706055,
            "startTime": 3.759999990463257,
            "text": "force"
          }
        ]
      }
    ]
  }
];

const wordsOut = [
  {
    end: 1.0399999618530273,
    start: 0.019999999552965164,
    text: "soldiers",
    confidence: -69.76224517822266,
  },
  {
    end: 1.459999918937683,
    start: 1.059999942779541,
    text: "sailors",
    confidence: -69.76224517822266,
  },
  {
    end: 1.6200000047683716,
    start: 1.4800000190734863,
    text: "and",
    confidence: -69.76224517822266,
  },
  {
    end: 2.1599998474121094,
    start: 1.659999966621399,
    text: "airmen",
    confidence: -69.76224517822266,
  },
  {
    end: 2.5,
    start: 2.3399999141693115,
    text: "of",
    confidence: -69.76224517822266,
  },
  {
    end: 2.619999885559082,
    start: 2.5199999809265137,
    text: "the",
    confidence: -69.76224517822266,
  },
  {
    end: 2.9600000381469727,
    start: 2.6599998474121094,
    text: "allied",
    confidence: -69.76224517822266,
  },
  {
    end: 3.679999828338623,
    start: 2.9800000190734863,
    text: "expeditionary",
    confidence: -69.76224517822266,
  },
  {
    end: 4.079999923706055,
    start: 3.759999990463257,
    text: "force",
    confidence: -69.76224517822266,
  },
];

describe('operators.mapDeepSpeechSttToWords', () => {
  it('should map events into word objects', marbles(m => {
    const input$ = m.cold('----(0|)', deepspeechEvents);
    const actual$ = input$.pipe(mapDeepSpeechSttToWords());
    const expected$ = m.cold('----(012345678|)', wordsOut);
    m.expect(actual$).toBeObservable(expected$);
  }));
});
