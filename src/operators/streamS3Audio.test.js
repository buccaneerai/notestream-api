import {expect} from 'chai';
import sinon from 'sinon';
import {marbles} from 'rxjs-marbles/mocha';

import streamS3Audio from './streamS3Audio';

describe('ws.streamS3Audio', () => {
  it('should space out chunks over time when realtime option is true', marbles(m => {
    const buffers = [Buffer.from('012'), Buffer.from('345'), Buffer.from('678')];
    const fileOut$ = m.cold('-0--1-(2|)', buffers);
    const params = {
      s3Key: 'foobar',
      s3Bucket: 'foobar.png',
      _downloadS3File: () => m.cold('-0--1-(2|)', buffers),
      timeInterval: 1,
    };
    const actual$ = streamS3Audio(params);
    const expected$ = m.cold('-0---1--(2|)', buffers);
    m.expect(actual$).toBeObservable(expected$);
  }));
});
