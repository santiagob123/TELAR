import OpenAI from 'openai'

export type AIProviderMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const DEFAULT_OPENAI_MODEL = 'gpt-4o'
const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434'
const PROVIDER_TIMEOUT_MS = 30000

function getConfiguredProvider(): 'ollama' | 'openai' | 'fallback' {
  const configured = (process.env.AI_PROVIDER || '').trim().toLowerCase()
  if (configured === 'ollama' || configured === 'openai' || configured === 'fallback') {
    return configured
  }

  return process.env.OPENAI_API_KEY?.trim() ? 'openai' : 'fallback'
}

function getOpenAiConfig() {
  const rawKey = process.env.OPENAI_API_KEY
  const hasKey = Boolean(rawKey && rawKey.trim())
  const model = (process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL).trim() || DEFAULT_OPENAI_MODEL
  return { hasKey, model, apiKey: hasKey ? rawKey!.trim() : '' }
}

function getOllamaConfig() {
  const baseUrl = (process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL).trim().replace(/\/$/, '')
  const model = (process.env.OLLAMA_MODEL || '').trim()
  return { baseUrl, model }
}

async function generateWithOllama(messages: AIProviderMessage[]): Promise<string> {
  const { baseUrl, model } = getOllamaConfig()
  if (!model) throw new Error('OLLAMA_MODEL no está configurado')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS)

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: false }),
      signal: controller.signal
    })

    if (!response.ok) throw new Error(`Ollama respondió HTTP ${response.status}`)

    const data = await response.json() as { message?: { content?: string } }
    const reply = data.message?.content?.trim()
    if (!reply) throw new Error('Ollama devolvió una respuesta vacía')
    return reply
  } finally {
    clearTimeout(timeout)
  }
}

async function generateWithOpenAI(messages: AIProviderMessage[]): Promise<string> {
  const { hasKey, model, apiKey } = getOpenAiConfig()
  if (!hasKey) throw new Error('OPENAI_API_KEY no está configurada')

  const client = new OpenAI({ apiKey })
  const response = await client.chat.completions.create({
    model,
    messages,
    max_tokens: 300
  })
  const reply = response.choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error('OpenAI devolvió una respuesta vacía')
  return reply
}

export function getAIProvider() {
  return getConfiguredProvider()
}

export async function generateAIResponse(messages: AIProviderMessage[]): Promise<string> {
  const provider = getConfiguredProvider()
  if (provider === 'ollama') return generateWithOllama(messages)
  if (provider === 'openai') return generateWithOpenAI(messages)
  throw new Error('Proveedor configurado como fallback')
}