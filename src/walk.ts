import * as fs from 'fs'
import * as path from 'path'
import { minimatch } from 'minimatch'

export function walkFiles (
  dir: string,
  include: string[] = ['*.*'],
  exclude: string[] = [],
  currentFiles: string[] = [],
  currentPath: string = ''
): string[] {
  fs.readdirSync(path.join(dir, currentPath)).forEach(item => {
    const relativePath = path.join(currentPath, item)
    const fullPath = path.join(dir, relativePath)
    const isFile = fs.statSync(fullPath).isFile()

    if (isFile) {
      const shouldInclude = include.some(pattern =>
        minimatch(relativePath, pattern)
      )
      const shouldExclude = exclude.some(pattern =>
        minimatch(relativePath, pattern)
      )

      if (shouldInclude && !shouldExclude) {
        currentFiles.push(relativePath)
      }
    } else {
      walkFiles(dir, include, exclude, currentFiles, relativePath)
    }
  })

  return currentFiles
}
