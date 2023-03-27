import * as fs from 'fs'
import * as path from 'path'
import { minimatch } from 'minimatch'

export function walkFiles (
  dir: string,
  include: string[] = ['*'],
  exclude: string[] = [],
  currentFiles: string[] = []
): string[] {
  fs.readdirSync(dir).forEach(item => {
    const fullPath = path.resolve(dir, item)
    const isFile = fs.statSync(fullPath).isFile()

    if (isFile) {
      const shouldInclude = include.some(pattern =>
        minimatch(fullPath, pattern)
      )
      const shouldExclude = exclude.some(pattern =>
        minimatch(fullPath, pattern)
      )

      if (shouldInclude && !shouldExclude) {
        currentFiles.push(fullPath)
      }
    } else {
      walkFiles(fullPath, include, exclude, currentFiles)
    }
  })

  return currentFiles
}
