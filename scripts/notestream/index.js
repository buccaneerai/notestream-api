const path = require('path');
const dotenv = require('dotenv');
// const get = require('lodash/get');
const {Command} = require('commander');
// const runPipeline = require('./lib/runPipeline');
// const s3FileToSTT = require('./lib/fileToSTT');
const testWebsocket = require('./lib/testWebsocket');
const liveStream = require('./lib/liveStream');

const program = new Command();
dotenv.config({path: path.resolve(__dirname, '../../.env')});

// node ./bin/code-generators/generateScaffold --help
// program
//   .command('file2stt <audioFileId>')
//   .description('Runs the notestream STT pipeline on an S3 file')
//   .option('-d, --debug', 'output extra debugging')
//   .option('-b, --bucket', 's3 Bucket', get(process.env, 'S3_DATA_STORAGE_BUCKET', null))
//   .option(
//     '-e, --engines [...sttEngines]',
//     'One or more STT Engines to use from [gcp,aws,awsMed,deepgram]',
//     ['gcp']
//   )
//   .option('--save-audio', 'Boolean: store audio to S3', false)
//   .option('--save-raw-stt', 'Boolean: store raw STT to S3', false)
//   .option('--save-words', 'Boolean: store raw words to S3', false)
//   .option('-a, --secret-token', 'JWT token', get(process.env, 'JWT_TOKEN', null))
//   .action((audioFileId, opts) => runPipeline(s3FileToSTT(audioFileId, opts));
  // .option('--plural-form <pluralForm>', 'the plural form of the resource name (defaults to adding an "s")')
  // .option('--dry-run', 'write output to console instead of files')
  // .option('-w --without', 'model, create, remove, delete, update')
  // .option('-f --force', 'overwrite existing files')
  // .action((resourceName, fields, options) => (
    // generateScaffold({name: resourceName, fields, ...options}))
  // );

// JWT token corresponding to the test Practitioner user
const fakeUserToken = process.env.FAKE_USER_JWT;
const audioFilePath = path.resolve(
  __dirname,
  '../audio-samples/headache-sample.l16'
);
program
  .command('from-file')
  .option('-f, --audio-file-id <audioFileId>', 'audio file to run', '60621d23347140dc6007dba2')
  .option('-u, --url <url>', 'url of server',`http://localhost:${process.env.PORT}`)
  .option('-a, --token <token>', 'JWT token', fakeUserToken)
  .option('--stt-engines <sttEngines...>', 'stt engines to use', ['aws-medical', 'gcp', 'ibm'])
  .option('--ensemblers <ensemblers...>', 'ensemblers to use', [])
  .option('--input-type <inputType>', 'input source type', 'audioFile')
  .option('--take <take>', 'Number of seconds to sample', null)
  .option('--save-raw-stt', 'whether to store raw STT ooutput', true)
  .option('--save-words', 'whether to store word output', true)
  .option('--save-windows', 'whether to save note windows', true)
  .action(opts => testWebsocket(opts))

program
  .command('from-stream')
  .option('-u, --url <url>', 'target URL', `http://localhost:${process.env.PORT}`)
  .option('-t, --token <token>', 'JWT token', fakeUserToken)
  .option('-i, --input-file-path <inputFilePath>', 'Path to (LINEAR16) audio file', audioFilePath)
  .option('-e, --stt-engines <sttEngines...>', 'stt engines', ['aws-medical', 'gcp', 'ibm'])
  .option('--ensemblers <ensemblers...>', 'ensemblers', [])
  .option('--input-type <inputType>', 'input source type', 'audioStream')
  .option('--take <take>', 'Number of seconds to sample', null)
  .option('--skip <skip>', 'Number of seconds to skip', null)
  // .option('--json', 'Return only the final result (as JSON)', false)
  .option('--save-raw-stt', 'save raw STT output', false)
  .option('--save-words', 'save words output', false)
  .option('--save-windows', 'whether to save note windows', true)
  .action(opts => liveStream()({...opts})
    .subscribe(console.log,console.error,console.log.bind(null, 'DONE'))
  );

program.parse(process.argv);
