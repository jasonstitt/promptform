import * as path from 'path'
import { walkFiles } from '../src/walk'
import mockFs from 'mock-fs'

describe('walkFiles', () => {
  const testDir = path.join(__dirname, 'test_directory')

  beforeAll(() => {
    mockFs({
      [testDir]: {
        'file1.txt': '',
        'file2.js': '',
        subdir: {
          'file3.txt': '',
          'file4.js': ''
        }
      }
    })
  })

  afterAll(() => {
    mockFs.restore()
  })

  it('should return all files in current dir when no include or exclude patterns are provided', () => {
    const result = walkFiles(testDir)
    expect(result).toContain('file1.txt')
    expect(result).toContain('file2.js')
  })

  it('should return only files matching include pattern', () => {
    const result = walkFiles(testDir, ['**/*.txt'])
    expect(result).toContain('file1.txt')
    expect(result).toContain('subdir/file3.txt')
    expect(result).not.toContain('file2.js')
    expect(result).not.toContain('subdir/file4.js')
  })

  it('should exclude files matching exclude pattern', () => {
    const result = walkFiles(testDir, ['*'], ['*.js'])
    expect(result).toContain('file1.txt')
    expect(result).not.toContain('subdir/file3.txt')
    expect(result).not.toContain('file2.js')
    expect(result).not.toContain('subdir/file4.js')
  })

  it('should return files that match include pattern and do not match exclude pattern', () => {
    const result = walkFiles(testDir, ['*.txt'], ['subdir/*'])
    expect(result).toContain('file1.txt')
    expect(result).not.toContain('file2.js')
    expect(result).not.toContain('subdir/file3.txt')
    expect(result).not.toContain('subdir/file4.js')
  })

  it('should return an empty array if no files match the criteria', () => {
    const result = walkFiles(testDir, ['**/*.json'])
    expect(result).toEqual([])
  })
})
