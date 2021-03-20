// import _ = require('lodash');
// import {of} = require('rxjs');
// import {map} = require('rxjs/operators');

// import graphQLRequest = require('../ws/graphQLRequest';

// // import trace = require('./trace';

// // Note most exam findings fall under SCTID 271880003:
// // https://browser.ihtsdotools.org/?perspective=full&conceptId1=271880003&edition=MAIN/SNOMEDCT-US/2020-09-01&release=&languages=en
// module.exportsTemplates = [
//   // {
//   //   sctid: null, // unsure if there is a SNOMED concept for this...
//   //   name: 'general exam',
//   //   templateType: 'physicalExam',
//   //   description: 'What is the patient\'s general demeanor?',
//   //   normalFinding: null,
//   //   elements: [
//   //     {
//   //       name: 'cooperative',
//   //       sctid: null, // No match in SNOMED
//   //       observableEntitySCTID: null, // No match in SNOMED
//   //       normallyPresent: false,
//   //       description: 'Is the patient is cooperative, pleasant, etc?',
//   //       findings: [
//   //         {
//   //           inputType: 'boolean',
//   //           findingInputs: [
//   //             {
//   //               label: 'cooperative',
//   //               value: "true",
//   //               sctid: '427867005',
//   //               isNormal: true,
//   //             },
//   //             {
//   //               label: 'uncooperative',
//   //               value: "false",
//   //               sctid: '248042003',
//   //               isNormal: false,
//   //             }
//   //           ]
//   //         }
//   //       ],
//   //     },
//   //     {
//   //       name: 'distressed',
//   //       sctid: null, // No match in SNOMED
//   //       observableEntitySCTID: null, // No match in SNOMED
//   //       normallyPresent: false,
//   //       description: 'Is the patient distressed, agitated, etc?',
//   //       findings: [
//   //         {
//   //           inputType: 'boolean',
//   //           normallyPresent: false,
//   //           findingInputs: [
//   //             {
//   //               label: 'no acute distress',
//   //               value: "true",
//   //               sctid: null,
//   //               isNormal: true,
//   //             },
//   //             {
//   //               label: 'distressed',
//   //               value: "false",
//   //               sctid: '162718006',
//   //               isNormal: false,
//   //             }
//   //           ]
//   //         }
//   //       ],
//   //     }
//   //   ]
//   // },
//   {
//     name: "head exam",
//     code: "BC-headExam",
//     sctid: "162823000",
//     templateType: "physicalExam",
//     normalFinding: {
//       sctid: "162824006",
//       name: "no abnormality detected (NAD)",
//     },
//     elements: [
//       {
//         name: "Head Shape",
//         code: "BC-headShapeExam",
//         description: "Is the head shape normal or abnormal?",
//         noteSection: "exam",
//         bodySystem: "head",
//         findingCodes: ["SNO-301318003"],
//         findings: [
//           {
//             name: "normal head shape",
//             inputType: "boolean",
//             normallyPresent: true,
//             code: "SNO-301318003",
//             sctid: "301318003",
//             observableEntitySCTID: null,
//             findingInputCodes: ["BC-normalocephalic", "SNO-162827004"],
//             findingInputs: [
//               {
//                 label: "Normalocephalic",
//                 value: "true",
//                 code: "BC-normalocephalic",
//                 sctid: null,
//                 isNormal: true,
//               },
//               {
//                 label: "abnormal shape",
//                 value: "false",
//                 code: "SNO-162827004",
//                 sctid: "162827004",
//                 isNormal: false,
//               },
//             ]
//           }
//         ]
//       },
//       {
//         name: "Head Injury",
//         code: "BC-headInjuryExam",
//         description: "Are there any injuries (bruising, lacerations, etc) to the head?",
//         noteSection: "exam",
//         bodySystem: "head",
//         findingCodes: ["BC-headInjuryFinding"],
//         findings: [
//           {
//             name: "injuries to head",
//             code: "BC-headInjuryFinding",
//             inputType: "select",
//             normallyPresent: true,
//             findingInputCodes: ["BC-atraumaticHead", "SNO-82271004"],
//             findingInputs: [
//               // FIXME - there are many possible categories here...
//               {
//                 label: "Atraumatic (No Injuries)",
//                 value: "false",
//                 sctid: null,
//                 code: "BC-atraumaticHead",
//                 isNormal: true,
//               },
//               {
//                 label: "Head Injury",
//                 value: "true",
//                 code: "SNO-82271004",
//                 sctid: "82271004",
//                 isNormal: false,
//               },
//             ],
//           },
//         ],
//       }
//     ]
//   },
//   {
//     name: "eye exam",
//     code: "BC-eyeExam",
//     bodySystem: "eyes",
//     noteSection: "exam",
//     sctid: "36228007",
//     templateType: "physicalExam",
//     normalFinding: {
//       sctid: "162807000",
//       name: "no abnormality detected (NAD)",
//     },
//     elements: [
//       {
//         name: "Pupil Equality",
//         code: "BC-eyePupilEqualityExam",
//         description: "Are both pupils of equal size?",
//         noteSection: "exam",
//         bodySystem: "eyes",
//         findingCodes: ["SNO-363955005"],
//         findings: [
//           {
//             inputType: "boolean",
//             normallyPresent: true,
//             code: "SNO-363955005",
//             sctid: null,
//             observableEntitySCTID: "363955005",
//             findingInputCodes: ["SNO-301943000", "SNO-164024009"],
//             findingInputs: [{
//               label: "Pupils Equal",
//               value: "true",
//               code: "SNO-301943000",
//               sctid: "301943000",
//               isNormal: true,
//             },
//             {
//               label: "Pupils Unequal",
//               value: "false",
//               code: "SNO-164024009",
//               sctid: "164024009",
//               isNormal: false,
//             }]
//           }
//         ],
//       },
//       {
//         name: "Pupil Reaction",
//         code: "BC-eyePupilReactionExam",
//         description: "Do pupils react to light and accomodation?",
//         noteSection: "exam",
//         bodySystem: "eyes",
//         findingCodes: ["SNO-268976003"],
//         findings: [
//           {
//             name: "Pupil Reaction",
//             inputType: "select",
//             normallyPresent: true,
//             code: "SNO-268976003",
//             sctid: "268976003",
//             observableEntitySCTID: "271733001",
//             findingInputCodes: ["SNO-164038002", "SNO-103271006", "SNO-13353005", "SNO-164029004", "SNO-418683009", "SNO-823998002", "SNO-386660007"],
//             // FIXME: there are many possible pupil reactions...
//             // See: https://browser.ihtsdotools.org/?perspective=full&conceptId1=823998002&edition=MAIN/SNOMEDCT-US/2020-09-01&release=&languages=en
//             findingInputs: [
//               {
//                 label: "Pupils react to light and accomodation",
//                 code: "SNO-164038002",
//                 sctid: "164038002",
//                 isNormal: true,
//               },
//               {
//                 label: "Fixed dilation of pupil",
//                 code: "SNO-103271006",
//                 sctid: "103271006",
//                 isNormal: false,
//               },
//               {
//                 label: "No pupil reaction",
//                 code: "SNO-13353005",
//                 sctid: "13353005",
//                 isNormal: false,
//               },
//               {
//                 label: "Argyll Robinson pupils",
//                 code: "SNO-164029004",
//                 sctid: "164029004",
//                 isNormal: false,
//               },
//               {
//                 label: "Poor pupil reaction to myodermic eyedrop",
//                 code: "SNO-418683009",
//                 sctid: "418683009",
//                 isNormal: false,
//               },
//               {
//                 label: "Unequal reaction of bilateral pupils",
//                 code: "SNO-823998002",
//                 sctid: "823998002",
//                 isNormal: false,
//               },
//               {
//                 label: "Abnormal pupil reaction",
//                 code: "SNO-386660007",
//                 sctid: "386660007",
//                 isNormal: false,
//               }
//             ]
//           }
//         ]
//       },
//       {
//         name: "Pupil Size",
//         code: "BC-eyePupilSizeExam",
//         description: "How large are the pupils?",
//         noteSection: "exam",
//         bodySystem: "eyes",
//         findingCodes: ["SNO-301938007", "SNO-164020000"],
//         findings: [
//           {
//             name: "Pupil Size",
//             inputType: "select",
//             normallyPresent: true,
//             code: "SNO-301938007",
//             sctid: "301938007",
//             observableEntitySCTID: "363953003",
//             findingInputCodes: ["SNO-301941003", "SNO-271608006"],
//             findingInputs: [
//               {
//                 label: "Normal Size Pupil",
//                 sctid: "301941003",
//                 code: "SNO-301941003",
//                 isNormal: true,
//               },
//               // FIXME: how to model abnormal pupil size?
//               {

//                 label: "Pinpoint Pupils",
//                 sctid: "271608006",
//                 code: "SNO-271608006",
//                 isNormal: false,
//               }
//             ]
//           },
//           {
//             // FIXME - this needs to be uploaded...
//             name: "Pupil Size (mm)",
//             code: "SNO-164020000",
//             sctid: "164020000",
//             observableEntitySCTID: "363953003",
//             inputType: "number",
//             normallyPresent: false,
//             findingInputCodes: null,
//           }
//         ]
//       },
//       {
//         name: "Pupil Shape",
//         code: "BC-eyePupilShapeExam",
//         description: "What is the shape of the pupils?",
//         noteSection: "exam",
//         bodySystem: "eyes",
//         findingCodes: ["SNO-225591008"],
//         findings: [
//           {
//             inputType: "boolean",
//             normallyPresent: true,
//             code: "SNO-225591008",
//             sctid: "225591008",
//             observableEntitySCTID: "363954009",
//             findingInputCodes: ["BC-normalPupilShape", "SNO-79017007"],
//             findingInputs: [{
//               label: "Normal Pupil Shape",
//               value: "true",
//               sctid: null,
//               code: "BC-normalPupilShape",
//               isNormal: true,
//             },
//             {
//               label: "Abnormal Shape of Pupil",
//               value: "false",
//               code: "SNO-79017007",
//               sctid: "79017007",
//               isNormal: false,
//             }]
//           }
//         ]
//       },
//       {
//         name: "Sclera Color",
//         code: "BC-eyeScleraColorExam",
//         descriptions: "Are schlera (whites of the eyes) normal (white/anicteric) or colored (yellow, pale, etc)?",
//         noteSection: "exam",
//         bodySystem: "eyes",
//         findingCodes: ["SNO-366039006"],
//         findings: [
//           {
//             name: "Sclera Color",
//             inputType: "select",
//             normallyPresent: true,
//             code: "SNO-366039006",
//             sctid: "366039006",
//             observableEntitySCTID: "246974002",
//             findingInputCodes: ["SNO-427801009", "SNO-246975001", "SNO-428183006", "SNO-162816001"],
//             findingInputs: [
//               {
//                 label: "Normal (anicteric/white sclera)",
//                 code: "SNO-427801009",
//                 sctid: "427801009",
//                 isNormal: true,
//               },
//               {
//                 label: "Icterus (yellow schlera)",
//                 code: "SNO-246975001",
//                 sctid: "246975001",
//                 isNormal: false,
//               },
//               {
//                 label: "Pale Schlera",
//                 code: "SNO-428183006",
//                 sctid: "428183006",
//                 isNormal: false,
//               },
//               {
//                 label: "Colored Sclera",
//                 code: "SNO-162816001",
//                 sctid: "162816001",
//                 isNormal: false,
//               }
//             ]
//           }
//         ]
//       },
//       // {
//       //   name: 'Conjunctival Finding',
//       //   description: 'Do eyes show signs of pink eye?',
//       //   observableEntitySCTID: '363940001',
//       //   findings: [
//       //     {
//       //       inputType: 'boolean',
//       //       normallyPresent: true,
//       //       code: 'SNO-246875002',
//       //       sctid: '246875002',

//       //       findingInputs: [
//       //         // TODO
//       //       ]
//       //     }
//       //   ]
//       // },
//       // {
//       //   name: 'Occular Motion (Motility, EOM)',
//       //   description: 'Is extra-occular motion intact? (EOMI)',
//       //   code: '', // TODO
//       //   sctid: '',
//       //   observableEntitySCTID: '31763002',
//       //   findings: [
//       //     {
//       //       inputType: 'boolean',
//       //       normallyPresent: true,
//       //       findingInputs: [
//       //         {
//       //           label: 'Normal occular motion (EOMI)',
//       //           value: "true",
//       //           sctid: '103251002',
//       //           isNormal: true,
//       //         },
//       //         {
//       //           label: 'Abnormal occular motion (motility)',
//       //           value: "false",
//       //           sctid: '103252009',
//       //           isNormal: false,
//       //         }
//       //       ]
//       //     }
//       //   ]
//       // },
//       // {
//       //   name: 'Nystagmus',
//       // },
//       // {
//       //   name: 'Eye Lids',
//       // },
//       // {
//       //   name: 'Ophthalmoscopic discs and posterior segments',
//       // },
//     ]
//   },
//   // {
//   //   sctid: '',
//   //   name: 'noseExam',
//   //   templateType: 'physicalExam',
//   //   elements: []
//   // },
//   // {
//   //   sctid: '274794006',
//   //   name: 'nose exam',,
//   //   templateType: 'physicalExam',
//   //   elements: []
//   // },
//   // {
//   //   sctid: '164771005',
//   //   name: 'throat exam',,
//   //   templateType: 'physicalExam',
//   //   elements: []
//   // },
//   // {
//   //   sctid: '457601000124102',
//   //   name: 'neck exam',,
//   //   templateType: 'physicalExam',
//   //   elements: []
//   // }
// ];

// const mapPredictionsToExams = (templates = defaultTemplates) => (
//   predictions => (
//     templates.filter(t => (
//       _.isArray(predictions)
//       ? predictions.map(p => p.sctid).includes(t.sctid)
//       : t.sctid === predictions.sctid.toString()
//     ))
//   )
// );

// const filterEmptyResults = exams => exams.length;

// // The input observable can be either individual predictions or arrays of predictions
// // where each prediction has a {SCTID:String, confidence:Number(optional)}
// const predictPhysicalExamElements = () => predictions$ => {
//   const fakeExamCodes = [
//     'BC-headShapeExam',
//     'BC-headInjuryExam',
//     'BC-eyePupilEqualityExam',
//     'BC-eyePupilReactionExam',
//     'BC-eyePupilSizeExam',
//     'BC-eyePupilShapeExam',
//     'BC-eyeScleraColorExam',
//   ];
//   // Use graphQL query to fetch exams from database...
//   const out$ = of(...fakeExamCodes).pipe(
//     mergeMap(fakeExamCodes => fakeExamCodes.map(code => code)),
//     map(template => ({
//       elements: template.elements,
//       findings: template.elements.flatMap(e => _.get(e, 'findings', [])),
//       findingInputs: template.elements
//         .flatMap(e => (
//           _.get(e, 'findings', []).flatMap(f => f.findingInputs || [])
//         ))
//     }))
//   );
//   return out$;
// };
// // FIXME: use real predictions...
// // predictions$ => predictions$.pipe(
// //   trace('predictPhysicalExamElements.in'),
// //   map(codeMapper), // map predictions to physical exams
// //   filter(filterEmptyResults), // ignore empty results
// //   mergeMap(exams => of(...exams)) // emit results one at a time
// // )

// module.exports.testExports = {mapPredictionsToExams, filterEmptyResults};
// export default predictPhysicalExamElements;
