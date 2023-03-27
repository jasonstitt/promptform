import * as fs from 'fs'
import { Configuration, OpenAIApi } from 'openai'

export async function checkTokenActive (token: string): Promise<boolean> {
  const configuration = new Configuration({ apiKey: token })
  const openai = new OpenAIApi(configuration)
  try {
    await openai.listModels()
    return true
  } catch (error: any) {
    if (error.response?.status === 401) {
      return false
    }
    throw error
  }
}

export async function getOpenAiToken (
  tokenFilePath: string | undefined
): Promise<string | null> {
  let token: string | null = null

  if (tokenFilePath) {
    try {
      token = fs.readFileSync(tokenFilePath, 'utf-8').trim()
    } catch (error: any) {
      console.error(`Error reading the token file: ${error.message}`)
      return null
    }
  } else {
    token = process.env.OPENAI_API_TOKEN?.trim() || null
  }

  if (!token) {
    console.error(
      'No OpenAI API token provided. Please set it in --token-file or OPENAI_API_TOKEN'
    )
    return null
  }

  const tokenIsActive = await checkTokenActive(token)

  if (!tokenIsActive) {
    console.error(
      'The provided OpenAI API token is not active. Please provide a valid token.'
    )
    return null
  }

  return token
}
