import mockFs from 'mock-fs'
import { Configuration, OpenAIApi } from 'openai'
import { checkTokenActive, getOpenAiToken } from '../src/token'

jest.mock('openai')

const mockOpenAI = () => {
  (OpenAIApi as jest.Mock).mockImplementation(() => ({
    listModels: jest.fn().mockResolvedValue({})
  }))
}

const mockOpenAIReject = () => {
  (OpenAIApi as jest.Mock).mockImplementation(() => ({
    listModels: jest.fn().mockRejectedValue({response: { status: 401 }})
  }))
}

describe('checkTokenActive', () => {
  beforeEach(() => {
    mockOpenAI()
  })

  it('should return true if the token is active', async () => {
    const token = '12345'
    const result = await checkTokenActive(token)
    expect(result).toBe(true)
  })

  it('should return false if the token is not active', async () => {
    const token = '67890'
    mockOpenAIReject()
    const result = await checkTokenActive(token)
    expect(result).toBe(false)
  })
})

describe('getOpenAiToken', () => {
  beforeEach(() => {
    mockFs({
      'token-file': 'openai-token'
    })
  })

  afterEach(() => {
    mockFs.restore()
    process.env = {}
  })

  beforeEach(() => {
    mockOpenAI()
  })

  it('should return the token if provided in the file path', async () => {
    const tokenFilePath = 'token-file'
    const result = await getOpenAiToken(tokenFilePath)
    expect(result).toBe('openai-token')
  })

  it('should return the token if provided in the environment variable', async () => {
    process.env.OPENAI_API_TOKEN = '12345'
    const result = await getOpenAiToken(undefined)
    expect(result).toBe('12345')
  })

  it('should return null if no token is provided', async () => {
    const result = await getOpenAiToken(undefined)
    expect(result).toBe(null)
  })

  it('should return null if there is an error reading the token file', async () => {
    const tokenFilePath = 'invalid-file-path'
    const result = await getOpenAiToken(tokenFilePath)
    expect(result).toBe(null)
  })

  it('should return null if the token is not active', async () => {
    const tokenFilePath = 'token-file'
    mockOpenAIReject()
    const result = await getOpenAiToken(tokenFilePath)
    expect(result).toBe(null)
  })
})
