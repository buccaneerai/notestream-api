import { of } from 'rxjs';
import { map } from 'rxjs/operators';

export const defaultElements = [
  {
    name: 'HPI - Location',
    description: 'AKA region. Example: left leg',
    noteSection: 'hpi',
    bodySystem: null,
    sctid: null,
    code: 'BC-hpiLocation',
    observableEntitySCTID: null,
    findingCodes: ['BC-hpiLocationFinding'],
    findings: [
      {
        name: 'HPI - Location',
        inputType: 'text',
        findingInputs: ['BC-hpiLocationText'],
        code: 'BC-hpiLocationFinding',
      },
    ],
  },
  {
    name: 'HPI - Quality',
    description: 'AKA character. Example: aching, burning',
    noteSection: 'hpi',
    bodySystem: null,
    sctid: null,
    code: 'BC-hpiQuality',
    observableEntitySCTID: null,
    findingCodes: ['BC-hpiQuality'],
    findings: [
      {
        name: 'HPI - Quality',
        code: 'BC-hpiQuality',
        inputType: 'text',
        findingInputs: null,
        findingInputCodes: null,
      },
    ],
  },
  {
    name: 'HPI - Severity/Intensity',
    description: 'AKA intensity. Example: 7 on a scale of 10',
    sctid: '162465004', // (Finding)
    code: 'SNO-162465004',
    noteSection: 'hpi',
    bodySystem: null,
    // Also: 405162009 Level of Symptom Severity
    observableEntitySCTID: '405162009', // "Severity of symptom"
    findingCodes: ['BC-hpiSeverityScale', 'BC-hpiSeverityCategories'],
    findings: [
      {
        name: 'Severity (Scale of 1-10)',
        code: 'BC-hpiSeverityScale',
        inputType: 'number',
        inputConfig: {
          step: 1,
          min: 0,
          max: 10,
        },
        findingInputs: null,
      },
      {
        name: 'Severity (Categories)',
        code: 'BC-hpiSeverityCategories',
        inputType: 'select',
        defaultValue: null,
        findingInputs: [
          { label: 'Mild', sctid: '162468002', isNormal: false },
          { label: 'Moderate', sctid: '162469005', isNormal: false },
          { label: 'Severe', sctid: '162470006', isNormal: false },
          { label: 'Very Severe', sctid: '162471005', isNormal: false },
          { label: 'Trivial', sctid: '162466003', isNormal: false },
        ],
      },
    ],
  },
  {
    name: 'HPI - Duration/Onset',
    description: 'Example: started 3 days ago',
    sctid: '162442009', // observable entity
    code: 'SNO-162442009',
    noteSection: 'hpi',
    bodySystem: null,
    // Also: 405795006 Time of symptom onset
    observableEntitySCTID: '162442009', // "Duration of symptom"
    findingCodes: ['BC-hpiOnset'],
    findings: [
      {
        name: 'HPI - Onset',
        code: 'BC-hpiOnset',
        inputType: 'text',
        findingInputs: null,
      },
    ],
  },
  {
    name: 'HPI - Timing/Frequency',
    description: 'AKA frequency. Example: constant or comes and goes',
    noteSection: 'hpi',
    bodySystem: null,
    sctid: null,
    code: 'SNO-162451001',
    observableEntitySCTID: '162451001', // "Frequency of Symptom"
    findingCodes: ['BC-hpiTiming'],
    findings: [
      {
        name: 'HPI - Timing/Frequency',
        code: 'BC-hpiTiming',
        inputType: 'text',
        findingInputs: null,
      },
    ],
  },
  {
    name: 'HPI - Context',
    description: 'Example: lifted large object at work',
    noteSection: 'hpi',
    bodySystem: null,
    sctid: null,
    code: 'SNO-162492005',
    observableEntitySCTID: '162492005', // "Pattern of symptom "
    findingCodes: ['BC-hpiContext'],
    findings: [
      {
        name: 'HPI - Context',
        code: 'BC-hpiContext',
        inputType: 'text',
        findingInputs: null,
      },
    ],
  },
  {
    name: 'HPI - Aggravating Factors (Provacative)',
    description: 'Example: bright light makes it worse.',
    noteSection: 'hpi',
    bodySystem: null,
    sctid: '162473008',
    code: 'SNO-162473008',
    observableEntitySCTID: null,
    findingCodes: ['SNO-162474002'],
    findings: [
      {
        name: 'No Aggravating factors',
        code: 'SNO-162474002',
        sctid: '162474002',
      },
    ],
  },
  {
    name: 'HPI - Relieving Factors (Palliative)',
    description: 'Example: better when heat is applied',
    noteSection: 'hpi',
    bodySystem: null,
    sctid: '162483007', // "Relieving Factor" (finding)
    code: 'SNO-162483007',
    observableEntitySCTID: null,
    findingCodes: ['SNO-162484001'],
    findings: [
      {
        name: 'No relieving factors',
        code: 'SNO-162484001',
        sctid: '162484001',
      },
    ],
  },
  {
    name: 'HPI - Associated Signs and Symptoms',
    description: 'Example: numbness in left toe',
    noteSection: 'hpi',
    bodySystem: null,
    sctid: '102483000', // finding
    code: 'SNO-102483000',
    observableEntitySCTID: null,
    findingCodes: ['BC-hpiSymptoms'],
    findings: [
      {
        name: 'HPI - Signs/Symptoms',
        code: 'BC-hpiSymptoms',
        inputType: 'text',
        findingInputs: null,
      },
    ],
  },
];

const predictHPIElements = () =>
  of(...defaultElements).pipe(
    map(el => ({
      elements: [el],
      findings: el.findings || [],
      findingInputs: el.findings.flatMap(f => f.findingInputs),
    }))
  );

export default predictHPIElements;
