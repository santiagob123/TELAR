import OpenAI from 'openai'

export type AIProviderMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const DEFAULT_OPENAI_MODEL = 'gpt-4o'
const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434'
const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash'
const PROVIDER_TIMEOUT_MS = 60000

function getConfiguredProvider(): 'ollama' | 'openai' | 'gemini' | 'fallback' {
  const configured = (process.env.AI_PROVIDER || '').trim().toLowerCase()
  if (configured === 'ollama' || configured === 'openai' || configured === 'gemini' || configured === 'fallback') {
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

function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || ''
  const model = (process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim() || DEFAULT_GEMINI_MODEL
  return { apiKey, model }
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

async function generateWithGemini(messages: AIProviderMessage[]): Promise<string> {
  const { apiKey, model } = getGeminiConfig()
  if (!apiKey) throw new Error('GEMINI_API_KEY no está configurada')

  const systemMessage = messages.find(message => message.role === 'system')
  const contents = messages
    .filter(message => message.role !== 'system')
    .map(message => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }]
    }))

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS)
  const startedAt = Date.now()

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        ...(systemMessage ? {
          systemInstruction: {
            parts: [{ text: systemMessage.content }]
          }
        } : {}),
        contents
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      const errorBody = await response.text()
      let errorMessage = 'Respuesta de error sin detalle'

      try {
        const parsed = JSON.parse(errorBody) as {
          error?: { message?: string; status?: string; code?: number }
        }
        const providerError = parsed.error
        errorMessage = [
          providerError?.message,
          providerError?.status,
          providerError?.code ? `code ${providerError.code}` : undefined
        ].filter(Boolean).join(' | ') || errorMessage
      } catch {
        if (errorBody.trim()) errorMessage = errorBody.trim().slice(0, 300)
      }

      const providerError = new Error(errorMessage) as Error & { status?: number; code?: number | string }
      providerError.status = response.status
      providerError.code = response.status
      throw providerError
    }

    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim()
    if (!reply) throw new Error('Gemini devolvió una respuesta vacía')
    console.info('[TELAR AI] gemini_ok', {
      model,
      durationMs: Date.now() - startedAt,
      replyChars: reply.length
    })
    return reply
  } catch (error: unknown) {
    const providerError = error as { status?: number; code?: number | string; message?: string }
    console.error('[TELAR AI] gemini_error', {
      model,
      durationMs: Date.now() - startedAt,
      status: providerError.status ?? null,
      code: providerError.code ?? null,
      message: providerError.message || 'Error desconocido'
    })
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export function getAIProvider() {
  return getConfiguredProvider()
}

export async function generateAIResponse(messages: AIProviderMessage[]): Promise<string> {
  const provider = getConfiguredProvider()
  if (provider === 'ollama') return generateWithOllama(messages)
  if (provider === 'openai') return generateWithOpenAI(messages)
  if (provider === 'gemini') return generateWithGemini(messages)
  throw new Error('Proveedor configurado como fallback')
}