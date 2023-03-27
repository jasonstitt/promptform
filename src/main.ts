import fs from 'fs'
import path from 'path'
import { Configuration, OpenAIApi } from 'openai'
import { program } from './arguments'
import { walkFiles } from './walk'
import { getOpenAiToken } from './token'
import { runCompletionWithBackoff } from './completion'

program
  .action(async (basedir: string, opts: any) => {
    try {
      const files = walkFiles(basedir || '.', opts.include, opts.omit)
      console.error(`Found ${files.length} files to process`)
      const token = await getOpenAiToken(opts.tokenFile)
      if (token === null) {
        process.exit(1)
      }
      const configuration = new Configuration({ apiKey: token })
      const openai = new OpenAIApi(configuration)
      for (const file of files) {
        const filePath = path.resolve(basedir, file)
        const textInput = fs.readFileSync(filePath, 'utf-8')
        const textOutput = await runCompletionWithBackoff(openai, `${opts.prompt}\n${textInput}`)
        const outputFilename = filePath + '.out'
        fs.writeFileSync(outputFilename, textOutput)
      }
    } catch (error: any) {
      let errorText = error.stack
      if (error.response) {
        errorText = JSON.stringify(error.response.data, null, 2)
      }
      console.error(`There was an unexpected error (it crashed)\n\nThe details are:\n${errorText}`)
      process.exit(1)
    }
  })
  .parse(process.argv)
