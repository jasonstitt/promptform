import * as commander from 'commander';

export const program = new commander.Command();

program
  .argument('[basedir]', 'the directory to process (default: .)')
  .requiredOption('-i, --include <globPattern...>', 'glob pattern for files to process')
  .option('-o, --omit <globPattern...>', 'glob pattern for files to exclude from processing')
  .option('-p, --prompt <prompt', 'common prompt to prepend to each file')
  .option('-e, --extension <extension>', 'file extension to add to processed files')
  .option('--in-place', 'whether to replace file contents, incompatible with extension')
  .option('-d, --output-dir <dir>', 'a directory in which to output files in the same structure as the input tree')
  .option('-t, --token-file <path>', 'path to a file containing the OpenAI API token')
  .showHelpAfterError()