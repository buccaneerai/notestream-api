const { expect } = require('chai');
const { marbles } = require('rxjs-marbles/mocha');

const mapGcpSttToWords = require('./mapGcpSttToWords');

const gcpEvent = [
  {
    results: [
      {
        alternatives: [
          {
            words: [
              {
                startTime: {
                  seconds: '0',
                  nanos: 0,
                },
                endTime: {
                  seconds: '0',
                  nanos: 800000000,
                },
                word: 'soldiers',
                confidence: 0.9128385782241821,
                speaker_tag: 0,
              },
              {
                startTime: {
                  seconds: '0',
                  nanos: 900000000,
                },
                endTime: {
                  seconds: '1',
                  nanos: 400000000,
                },
                word: 'Sailors',
                confidence: 0.9128385782241821,
                speaker_tag: 0,
              },
              {
                startTime: {
                  seconds: '1',
                  nanos: 400000000,
                },
                endTime: {
                  seconds: '1',
                  nanos: 600000000,
                },
                word: 'and',
                confidence: 0.9128385782241821,
                speaker_tag: 0,
              },
              {
                startTime: {
                  seconds: '1',
                  nanos: 600000000,
                },
                endTime: {
                  seconds: '2',
                  nanos: 200000000,
                },
                word: 'Airmen',
                confidence: 0.9128385782241821,
                speaker_tag: 0,
              },
              {
                startTime: {
                  seconds: '2',
                  nanos: 200000000,
                },
                endTime: {
                  seconds: '2',
                  nanos: 400000000,
                },
                word: 'of',
                confidence: 0.9128385782241821,
                speaker_tag: 0,
              },
              {
                startTime: {
                  seconds: '2',
                  nanos: 400000000,
                },
                endTime: {
                  seconds: '2',
                  nanos: 500000000,
                },
                word: 'the',
                confidence: 0.9128385782241821,
                speaker_tag: 0,
              },
              {
                startTime: {
                  seconds: '2',
                  nanos: 500000000,
                },
                endTime: {
                  seconds: '2',
                  nanos: 900000000,
                },
                word: 'Allied',
                confidence: 0.9128385782241821,
                speaker_tag: 0,
              },
              {
                startTime: {
                  seconds: '2',
                  nanos: 900000000,
                },
                endTime: {
                  seconds: '3',
                  nanos: 700000000,
                },
                word: 'expeditionary',
                confidence: 0.9128385782241821,
                speaker_tag: 0,
              },
              {
                startTime: {
                  seconds: '3',
                  nanos: 700000000,
                },
                endTime: {
                  seconds: '4',
                  nanos: 100000000,
                },
                word: 'Force',
                confidence: 0.9128385782241821,
                speaker_tag: 0,
              },
            ],
            transcript: 'soldiers Sailors and Airmen of the Allied expeditionary Force',
            confidence: 0.862013578414917,
          },
        ],
        channelTag: 0,
        languageCode: 'en-us',
      },
    ],
  },
  {
    results: [
      {
        alternatives: [
          {
            words: [
              {
                startTime: {
                  seconds: '5',
                  nanos: 0,
                },
                endTime: {
                  seconds: '5',
                  nanos: 400000000,
                },
                word: 'You',
                confidence: 0.7075783014297485,
                speaker_tag: 0,
              },
              {
                startTime: {
                  seconds: '5',
                  nanos: 400000000,
                },
                endTime: {
                  seconds: '5',
                  nanos: 600000000,
                },
                word: 'are',
                confidence: 0.9128385782241821,
                speaker_tag: 0,
              },
              {
                startTime: {
                  seconds: '5',
                  nanos: 600000000,
                },
                endTime: {
                  seconds: '5',
                  nanos: 800000000,
                },
                word: 'about',
                confidence: 0.9128385782241821,
                speaker_tag: 0,
              },
              {
                startTime: {
                  seconds: '5',
                  nanos: 800000000,
                },
                endTime: {
                  seconds: '6',
                  nanos: 0,
                },
                word: 'to.',
                confidence: 0.9128385782241821,
                speaker_tag: 0,
              },
            ],
            transcript: ' You are about to.',
            confidence: 0.8615235090255737,
          },
        ],
        channelTag: 0,
        languageCode: 'en-us',
      },
    ]
  },
];

const wordsOut = {
  a: {
    start: 0,
    end: 0.8,
    text: 'soldiers',
    confidence: 0.9128385782241821,
    speakerTag: 0,
  },
  b: {
    start: 0.9,
    end: 1.4,
    text: 'Sailors',
    confidence: 0.9128385782241821,
    speakerTag: 0,
  },
  c: {
    start: 1.4,
    end: 1.6,
    text: 'and',
    confidence: 0.9128385782241821,
    speakerTag: 0,
  },
  d: {
    start: 1.6,
    end: 2.2,
    text: 'Airmen',
    confidence: 0.9128385782241821,
    speakerTag: 0,
  },
  e: {
    start: 2.2,
    end: 2.4,
    text: 'of',
    confidence: 0.9128385782241821,
    speakerTag: 0,
  },
  f: {
    start: 2.4,
    end: 2.5,
    text: 'the',
    confidence: 0.9128385782241821,
    speakerTag: 0,
  },
  g: {
    start: 2.5,
    end: 2.9,
    text: 'Allied',
    confidence: 0.9128385782241821,
    speakerTag: 0,
  },
  h: {
    start: 2.9,
    end: 3.7,
    text: 'expeditionary',
    confidence: 0.9128385782241821,
    speakerTag: 0,
  },
  i: {
    start: 3.7,
    end: 4.1,
    text: 'Force',
    confidence: 0.9128385782241821,
    speakerTag: 0,
  },
  j: {
    start: 5.0,
    end: 5.4,
    text: 'You',
    confidence: 0.7075783014297485,
    speakerTag: 0,
  },
  k: {
    start: 5.4,
    end: 5.6,
    text: 'are',
    confidence: 0.9128385782241821,
    speakerTag: 0,
  },
  l: {
    start: 5.6,
    end: 5.8,
    text: 'about',
    confidence: 0.9128385782241821,
    speakerTag: 0,
  },
  m: {
    start: 5.8,
    end: 6.0,
    text: 'to.',
    confidence: 0.9128385782241821,
    speakerTag: 0,
  },
};

describe('operators.mapGcpSttToWords', () => {
  it(
    'should map events into word objects',
    marbles(m => {
      const input$ = m.cold('---(01|)', gcpEvent);
      const actual$ = input$.pipe(mapGcpSttToWords());
      const expected$ = m.cold('---(abcdefghijklm|)', wordsOut);
      // const expected$ = m.cold('---(0|)', wordsOut);
      m.expect(actual$).toBeObservable(expected$);
    })
  );
});
