import { of } from 'rxjs';
import { map } from 'rxjs/operators';

export const defaultElements = [
  {
    name: 'Exercise Habits',
    description: 'Exercise habits of the patient',
    code: 'SNO-106020009',
    bodySystem: null,
    noteSection: 'pfsh',
    sctid: '106020009', // Finding of Exercise Activity Pattern
    observableEntitySCTID: null,
    findings: [
      {
        name: 'What do you do for exercise?', // see children of 106020009
        inputType: 'text',
        findingInputs: null,
      },
      {
        name: 'How often?', // see children of 106020009
        inputType: 'text',
        findingInputs: null,
      },
    ],
  },
];

const predictPFSHElements = () => () =>
  of(...defaultElements).pipe(
    map(el => ({
      elements: [el],
      findings: el.findings || [],
      findingInputs: el.findings.flatMap(f => f.findingInputs),
    }))
  );

export default predictPFSHElements;
