import { program } from './arguments'
import { walkFiles } from './walk'
import { getOpenAiToken } from './token'

program
  .action((basedir: string, opts: any) => {
    try {
      const files = walkFiles(basedir || '.', opts.include, opts.omit)
      console.error(`Found ${files.length} files to process`)
      const token = getOpenAiToken(opts.tokenFile)
      if (token === null) {
        process.exit(1)
      }
    } catch (error: any) {
      console.error(`There was an unexpected error (it crashed)\n\nThe details are:\n${error.stack}`)
      process.exit(1)
    }
  })
  .parse(process.argv)
