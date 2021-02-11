import { of } from 'rxjs';
import { map } from 'rxjs/operators';

export const defaultElements = [
  {
    name: 'ROS - General',
    description: 'General/constitutional symptoms',
    code: 'BC-rosGeneral',
    noteSection: 'ros',
    bodySystem: 'constitutional',
    sctid: null,
    observableEntitySCTID: null,
    findingCodes: [],
    findings: [
      {
        name: 'Fever',
        inputType: 'boolean',
        defaultValue: null,
        findingInputs: [
          {
            label: 'No',
            value: false,
            sctid: null,
            isNormal: true,
          },
          {
            label: 'Yes',
            value: true,
            sctid: '386661006',
            isNormal: false,
          },
        ],
      },
      {
        name: 'Tiredness',
        inputType: 'boolean',
        defaultValue: null,
        findingInputs: [
          {
            label: 'No',
            value: false,
            sctid: null,
            isNormal: true,
          },
          {
            label: 'Yes',
            value: true,
            sctid: '84229001',
            isNormal: false,
          },
        ],
      },
      {
        name: 'Swollen Glands',
        inputType: 'boolean',
        defaultValue: null,
        findingInputs: [
          {
            label: 'No',
            value: false,
            sctid: null,
            isNormal: true,
          },
          {
            label: 'Yes',
            value: true,
            sctid: null, // FIXME
            isNormal: false,
          },
        ],
      },
      {
        name: 'Excessive Thirst',
        inputType: 'boolean',
        defaultValue: null,
        findingInputs: [
          {
            label: 'No',
            value: false,
            sctid: null,
            isNormal: true,
          },
          {
            label: 'Yes',
            value: true,
            sctid: '17173007',
            isNormal: false,
          },
        ],
      },
      {
        name: 'Feeling Hot or Cold',
        inputType: 'boolean',
        defaultValue: null,
        findingInputs: [
          {
            label: 'No',
            value: false,
            sctid: null,
            isNormal: true,
          },
          {
            label: 'Yes',
            value: true,
            sctid: '103002009',
            isNormal: false,
          },
        ],
      },
      {
        name: 'Easy Bruising', // FIXME - missing "easy easy brusing OR bleeding"
        inputType: 'boolean',
        defaultValue: null,
        findingInputs: [
          {
            label: 'No',
            value: false,
            sctid: null,
            isNormal: true,
          },
          {
            label: 'Yes',
            value: true,
            sctid: '424131007',
            isNormal: false,
          },
        ],
      },
      {
        name: 'Easy Bleeding',
        inputType: 'boolean',
        defaultValue: null,
        findingInputs: [
          {
            label: 'No',
            value: false,
            sctid: null,
            isNormal: true,
          },
          {
            label: 'Yes',
            value: true,
            sctid: '424131007',
            isNormal: false,
          },
        ],
      },
      {
        name: 'Loss of consciousness',
        inputType: 'boolean',
        defaultValue: null,
        findingInputs: [
          {
            label: 'No',
            value: false,
            sctid: null,
            isNormal: true,
          },
          {
            label: 'Yes',
            value: true,
            sctid: '419045004',
            isNormal: false,
          },
        ],
      },
    ],
  },
];

const predictROSElements = () => () =>
  of(...defaultElements).pipe(
    map(el => ({
      elements: [el],
      findings: el.findings || [],
      findingInputs: el.findings.flatMap(f => f.findingInputs) || [],
    }))
  );

export default predictROSElements;
