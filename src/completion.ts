import { OpenAIApi } from 'openai'

export async function runCompletionWithBackoff (
  openai: OpenAIApi,
  prompt: string,
  modelName: string = 'gpt-3.5-turbo',
  maxTokens: number = 4097,
  temperature: number = 0.5
): Promise<string> {
  const maxTries = 3
  const baseInterval = 500
  const backoffFactor = 1.5
  let currentInterval = baseInterval

  for (let i = 0; i < maxTries; i++) {
    try {
      const result = await openai.createChatCompletion({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens - prompt.length,
        n: 1,
        temperature: temperature
      })
      return result.data.choices[0]?.message?.content || ''
    } catch (error: any) {
      if (error.message.includes('rate limit')) {
        if (i === maxTries - 1) {
          throw error
        }
        await sleep(currentInterval)
        currentInterval *= backoffFactor
      } else {
        throw error
      }
    }
  }

  throw new Error('Max retries reached.')
}

function sleep (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
