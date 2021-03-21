const get = require('lodash/get');
const {Command} = require('commander');
const runPipeline = require('./lib/runPipeline');
const s3FileToSTT = require('./lib/fileToSTT');

const program = new Command();

// node ./bin/code-generators/generateScaffold --help
program
  .command('stt <audioFileS3Key>')
  .description('Runs the notestream STT pipeline on an S3 file')
  .option('-d, --debug', 'output extra debugging')
  .option('-b, --bucket', 's3 Bucket', get(process.env, 'S3_DATA_STORAGE_BUCKET', null))
  .option('-e, --engines [...sttEngines]', 'One or more s3Engines to use', ['gcp'])
  .action((audioFileS3Key, options) =>
    runPipeline(s3FileToSTT(audioFileS3Key, options)
  );
  // .option('--plural-form <pluralForm>', 'the plural form of the resource name (defaults to adding an "s")')
  // .option('--dry-run', 'write output to console instead of files')
  // .option('-w --without', 'model, create, remove, delete, update')
  // .option('-f --force', 'overwrite existing files')
  // .action((resourceName, fields, options) => (
    // generateScaffold({name: resourceName, fields, ...options}))
  // );

program.parse(process.argv);
