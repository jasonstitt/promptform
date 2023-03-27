import { promises as fs } from 'fs'
import path from 'path'
import bluebird from 'bluebird'
import { mkdirp } from 'mkdirp'
import { Configuration, OpenAIApi } from 'openai'
import { program } from './arguments'
import { walkFiles } from './walk'
import { getOpenAiToken } from './token'
import { runCompletionWithBackoff } from './completion'

class UserError extends Error {}

program
  .action(async (basedir: string, opts: any) => {
    try {
      // Validate options
      if (opts.inPlace && opts.extension) {
        throw new UserError('Cannot use both --in-place and --extension')
      } else if (opts.inPlace && opts.outputDir) {
        throw new UserError('Cannot use both --in-place and --output-dir')
      } else if (!opts.inPlace && !opts.extension) {
        opts.extension = '.promptform'
      }
      if (opts.promptFile) {
        if (opts.prompt) {
          throw new UserError('Cannot use both --prompt and --prompt-file')
        }
        opts.prompt = await fs.readFile(opts.promptFile, 'utf-8')
      }
      // Process files
      const files = walkFiles(basedir || '.', opts.include, opts.omit)
      console.error(`Found ${files.length} files to process`)
      const token = await getOpenAiToken(opts.tokenFile)
      if (token === null) {
        process.exit(1)
      }
      const configuration = new Configuration({ apiKey: token })
      const openai = new OpenAIApi(configuration)
      const extension = opts.extension || ''
      await bluebird.map(
        files,
        async (file: string) => {
          const filePath = path.resolve(basedir, file)
          const textInput = await fs.readFile(filePath, 'utf-8')
          const textOutput = await runCompletionWithBackoff(
            openai,
            `${opts.prompt}\n${textInput}`,
            opts.model,
            opts.maxTokens,
            opts.temperature
          )
          const outputFilename =
            path.resolve(opts.outputDir || basedir, file) + extension
          if (opts.outputDir) {
            const outputDirPath = path.dirname(outputFilename)
            await mkdirp(outputDirPath)
          }
          await fs.writeFile(outputFilename, textOutput)
          console.error(`${outputFilename}`)
        },
        { concurrency: Number(opts.concurrency) }
      )
    } catch (error: any) {
      let errorText = error.stack
      if (error instanceof UserError) {
        console.error(error.message)
        process.exit(1)
      } else if (error.response) {
        errorText = JSON.stringify(error.response.data, null, 2)
      }
      console.error(
        `There was an unexpected error (it crashed)\n\nThe details are:\n${errorText}`
      )
      process.exit(1)
    }
  })
  .parse(process.argv)
