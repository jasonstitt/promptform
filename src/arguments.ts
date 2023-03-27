import * as commander from 'commander';

export const program = new commander.Command();

function parsePositiveInt(value: string): number {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue) || parsedValue <= 0) {
    throw new commander.InvalidArgumentError('must be a positive integer');
  }
  return parsedValue;
}

function parsePositiveFloat(value: string): number {
  const parsedValue = parseFloat(value);
  if (isNaN(parsedValue) || parsedValue <= 0) {
    throw new commander.InvalidArgumentError('must be a positive float');
  }
  return parsedValue;
}

program
  .argument('[basedir]', 'the directory to process (default: .)')
  .requiredOption('-i, --include <globPattern...>', 'glob pattern for files to process')
  .option('-o, --omit <globPattern...>', 'glob pattern for files to exclude from processing')
  .option('-p, --prompt <prompt>', 'common prompt to prepend to each file')
  .option('-f, --prompt-file <filename>', 'file containing common prompt to prepend to each file')
  .option('-e, --extension <extension>', 'file extension to add to processed files')
  .option('--in-place', 'whether to replace file contents, incompatible with extension')
  .option('-d, --output-dir <dir>', 'a directory in which to output files in the same structure as the input tree')
  .option('-t, --token-file <path>', 'path to a file containing the OpenAI API token')
  .option('-n, --concurrency <number>', 'number of concurrent tasks to run (default 5)', parsePositiveInt, 5)
  .option('-m, --model <model>', 'model to use for completion (default: gpt-3.5-turbo)', 'gpt-3.5-turbo')
  .option('--temperature <temperature>', 'temperature to use for completion (default: 1)', parsePositiveFloat, 1.0)
  .option('--max-tokens <maxTokens>', 'maximum number of total input + output tokens (default: 4097)', parsePositiveInt, 4097)
  .showHelpAfterError()
