// import {expect} from 'chai';
// import {of} from 'rxjs';
// import sinon from 'sinon';
// import {finalize, tap} from 'rxjs/operators';
// import {marbles,observe} from 'rxjs-marbles/mocha';

// import predictPhysicalExamElements, {defaultTemplates} from './predictPhysicalExamElements';

// describe('predictPhysicalExamElements', () => {
//   it('should output correct physical exams when given valid predictions', observe(() => {
//     expect(2);
//     const predictions = [
//       {sctid: '162823000', confidence: 0.50}, // HEAD EXAM
//       {sctid: '01234567', confidence: 0.80}, // IRRELEVANT PREDICTION
//       [{sctid: '36228007', confidence: 0.50}], // EYE EXAM
//     ];
//     const onData = sinon.spy();
//     return of(...predictions).pipe(
//       predictPhysicalExamElements(),
//       tap(onData),
//       finalize(() => {
//         expect(onData.getCall(0).args[0]).to.deep.equal(defaultTemplates[0]);
//         expect(onData.getCall(1).args[0]).to.deep.equal(defaultTemplates[1]);
//       })
//     );
//   }));



//   // it('should output correct observable timings', marbles(m => {
//   //   const predictions = [
//   //     {sctid: '162823000', confidence: 0.50}, // HEAD EXAM
//   //     {sctid: '01234567', confidence: 0.80}, // IRRELEVANT PREDICTION
//   //     [{sctid: '36228007', confidence: 0.50}], // EYE EXAM
//   //   ];
//   //   const input$ = m.cold('-0--1-(2|)', predictions);
//   //   const actual$ = input$.pipe(predictExamIntents());
//   //   const expected$ = m.cold('-0----(1|)');
//   //   m.expect(actual$).toBeObservable(expected$);
//   // }));
// });
