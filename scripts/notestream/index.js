const path = require('path');
const dotenv = require('dotenv');
// const get = require('lodash/get');
const {Command} = require('commander');
// const runPipeline = require('./lib/runPipeline');
// const s3FileToSTT = require('./lib/fileToSTT');
const testWebsocket = require('./lib/testWebsocket');

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

program
  .command('simulate')
  .option('-f, --audio-file-id <audioFileId>', 'audio file to run', '60621d23347140dc6007dba2')
  .option('-u, --url <url>', 'url of server',`http://localhost:${process.env.PORT}`)
  .option('-a, --token <token>', 'JWT token', process.env.JWT_TOKEN)
  .option('--stt-engines <sttEngines...>', 'stt engines to use', ['aws-medical', 'gcp', 'ibm'])
  .option('--ensemblers <ensemblers...>', 'ensemblers to use', null)
  .option('--save-words', 'whether to store word output', true)
  .option('--save-raw-stt', 'whether to store raw STT ooutput', true)
  .option('--save-windows', 'whether to save note windows', true)
  .action(opts => testWebsocket(opts))

program.parse(process.argv);
