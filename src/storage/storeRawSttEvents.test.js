const {expect} = require('chai');
const sinon = require('sinon');
const {of} = require('rxjs');
const {map,tap} = require('rxjs/operators');
const {marbles} = require('rxjs-marbles/mocha');

const storeRawSTTEvents = require('./storeRawSttEvents');

const fakeGcpEvents = [
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

const fakeAWSEvents = [
];

const fakeDeepgramEvents = [
];

describe('storeRawSttEvents', () => {
  it('should export a function', () => {
    expect(storeRawSTTEvents).to.be.a('function');
  });

  it('should call s3 operator with correct parameters', () => {
    const initializedOperator = sinon.stub().returns(data => data);
    const operator = sinon.stub().returns(initializedOperator);
    const params = [
      {runId: 'abc', sttEngine: 'gcp'},
      {s3Bucket: 'mr-bucket', prefixDir: 'stt'},
      operator
    ];
    const out$ = of('foo').pipe(storeRawSTTEvents(...params));
    expect(operator.calledOnce).to.be.true;
    expect(operator.getCall(0).args[0]).to.deep.equal({
      s3Bucket: 'mr-bucket',
      s3Key: 'stt/abc/gcp.json',
    });
  });

  it('should parse GCP events correctly', marbles(m => {
    const storeData = sinon.stub().returns();
    const initializedOperator = sinon.stub().returns(storeData);
    const storageOp = sinon.stub().returns(initializedOperator);
    const params = [
      {runId: 'abc', sttEngine: 'gcp'},
      {s3Bucket: 'mr-bucket', prefixDir: 'audio'},
      storageOp,
    ];
    const source$ = m.cold('0--12|', fakeGcpEvents);
    const actual$ = source$.pipe(storeRawSTTEvents(params));
    const expected$ = m.cold('0--12|', fakeGcpEvents);
    m.expect(actual$).toBeObservable(expected$);
    expect(storeData.callCount).to.equal(4);
    expect(storeData.getCall(0).args[0]).to.equal('[');
    expect(storeData.getCall(1).args[0]).to.equal(JSON.stringify(fakeGcpEvents[0]));
    expect(storeData.getCall(2).args[0]).to.equal(JSON.stringify(fakeGcpEvents[1]));
    expect(storeData.getCall(3).args[0]).to.equal(']');
  }));

  // it('should handle AWS events correctly', marbles(m => {
  //   const initializedOperator = sinon.stub().returns(data => data);
  //   const operator = sinon.stub().returns(initializedOperator);
  //   const params = {
  //     encounterId: 'abc',
  //     options: {s3Bucket: 'mr-bucket', prefixDir: 'audio'},
  //     _toS3File: operator,
  //   };
  //   const source$ = m.cold('0--12|', fakeAWSEvents);
  //   const actual$ = source$.pipe(storeRawSTTEvents(params));
  //   const expected$ = m.cold('0--12|', fakeAWSEvents);
  //   expect(true).to.equal(false);
  // }));

  // it('should handle Deepgram events correctly', marbles(m => {
  //   const initializedOperator = sinon.stub().returns(data => data);
  //   const operator = sinon.stub().returns(initializedOperator);
  //   const params = {
  //     encounterId: 'abc',
  //     options: {s3Bucket: 'mr-bucket', prefixDir: 'audio'},
  //     _toS3File: operator,
  //   };
  //   const fakeBuffers = [
  //     Buffer.from('0111', 'base64'),
  //     Buffer.from('1011100', 'base64'),
  //     Buffer.from('0011', 'base64'),
  //   ];
  //   const source$ = m.cold('0--12|', fakeDeepgramEvents);
  //   const actual$ = source$.pipe(storeRawSTTEvents(params));
  //   const expected$ = m.cold('0--12|', fakeDeepgramEvents);
  //   expect(true).to.equal(false);
  // }));

  it('should be integrated into pipeline and tested', () => {
    expect(true).to.equal(false);
  });
});
