// const prompt = require('prompt');
// const optimist = require('optimist');
// const AWS = require('aws-sdk');

// const ecs = new AWS.ECS({region: 'us-east-1'});
// // const serviceName = 'pbapi';
// // const stage = process.env.STAGE;

// // if (!stage) throw new Error('must set process.env.STAGE!');
// // if (!serviceName) throw new Error('must set process.env.SERVICE_NAME!');

// function redeploy({stage, serviceName}) {
//   const params = {
//     cluster: stage,
//     service: `${stage}-${serviceName}`,
//     forceNewDeployment: true,
//   };

//   ecs.updateService(params, (err, res) => {
//     if (err) throw err;
//     console.log('ECS.updateService response: ', res);
//     return;
//   });
// }


// const schema = {
//   properties: {
//     stage: {
//       description: 'Which stage should be forced to re-deploy? (prod, staging, etc)',
//       type: 'string',
//       required: true,
//     },
//     serviceName: {
//       type: 'string',
//       default: 'clinical-api',
//     }
//   }
// };
// prompt.override = optimist.argv;
// prompt.start();
// prompt.get(schema, (err, params) => redeploy(params));
