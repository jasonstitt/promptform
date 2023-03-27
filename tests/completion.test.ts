import { OpenAIApi } from 'openai'
import { mocked } from 'jest-mock'
import { runCompletionWithBackoff } from '../src/completion'

jest.mock('openai')
jest.useFakeTimers()

const MockOpenAI = mocked(OpenAIApi, { shallow: true })

const runTimersTimes = async (times: number) => {
  for (let i = 0; i < times; i++) {
    await Promise.resolve()
    jest.runAllTimers()
  }
}

describe('runCompletionWithBackoff', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should call createChatCompletion with the correct arguments', async () => {
    const openai = new OpenAIApi()
    const prompt = 'Test prompt'
    const result = {
      data: { choices: [{ message: { content: 'Test response' } }] }
    }
    MockOpenAI.prototype.createChatCompletion.mockResolvedValue(result)
    await runCompletionWithBackoff(openai, prompt)
    expect(MockOpenAI.prototype.createChatCompletion).toHaveBeenCalledWith({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4097 - prompt.length,
      n: 1,
      temperature: 0.5
    })
  })

  it('should return the message content of the first choice', async () => {
    const openai = new OpenAIApi()
    const prompt = 'Test prompt'
    const expectedResult = 'Test response'
    const result = {
      data: { choices: [{ message: { content: expectedResult } }] }
    }
    MockOpenAI.prototype.createChatCompletion.mockResolvedValue(result)
    const response = await runCompletionWithBackoff(openai, prompt)
    expect(response).toEqual(expectedResult)
  })

  it('should retry on rate limit error', async () => {
    const openai = new OpenAIApi()
    const prompt = 'Test prompt'
    const rateLimitError = new Error('rate limit')
    const result = {
      data: { choices: [{ message: { content: 'Test response' } }] }
    }
    MockOpenAI.prototype.createChatCompletion
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce(result)
    const response = runCompletionWithBackoff(openai, prompt)
    await runTimersTimes(1)
    expect(await response).toEqual(result.data.choices[0].message.content)
    expect(MockOpenAI.prototype.createChatCompletion).toHaveBeenCalledTimes(2)
  })

  it('should throw a rate limit error when rate limited', async () => {
    const openai = new OpenAIApi()
    const prompt = 'Test prompt'
    const rateLimitError = new Error('rate limit')
    MockOpenAI.prototype.createChatCompletion.mockRejectedValue(rateLimitError)
    jest.useFakeTimers()
    const result = runCompletionWithBackoff(openai, prompt)
    await runTimersTimes(10)
    await expect(result).rejects.toThrowError(rateLimitError)
  })

  it('should throw a non-rate limit error as a StopError', async () => {
    const openai = new OpenAIApi()
    const prompt = 'Test prompt'
    const otherError = new Error('other error')
    MockOpenAI.prototype.createChatCompletion.mockRejectedValue(otherError)
    await expect(runCompletionWithBackoff(openai, prompt)).rejects.toThrowError(
      otherError
    )
  })
})
