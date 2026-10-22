import OpenAI from 'openai'

export type AIProviderMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type AIResponseOptions = {
  responseFormat?: 'json'
  responseSchema?: Record<string, unknown>
}

const DEFAULT_OPENAI_MODEL = 'gpt-4o'
const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434'
const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash'
const PROVIDER_TIMEOUT_MS = 60000

function getProviderTimeoutMs() {
  const configured = Number(process.env.OPENAI_TIMEOUT_MS)
  return Number.isSafeInteger(configured) && configured > 0 ? configured : PROVIDER_TIMEOUT_MS
}

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

function qwenNeedsReasoning(messages: AIProviderMessage[]) {
  const question = [...messages].reverse().find(message => message.role === 'user')?.content || ''
  return question.length > 180 || /\b(analiza|compara|paso a paso|planifica|resuelve|calcula|evalua|evalúa|diferencia)\b/i.test(question)
}

async function generateWithOllama(messages: AIProviderMessage[], onToken?: (chunk: string) => void, options?: AIResponseOptions): Promise<string> {
  const { baseUrl, model } = getOllamaConfig()
  if (!model) throw new Error('OLLAMA_MODEL no está configurado')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), getProviderTimeoutMs())
  const startedAt = Date.now()
  let firstTokenMs: number | null = null

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: Boolean(onToken),
        ...(options?.responseFormat === 'json' ? { format: 'json' } : {}),
        ...(/(^|\/)qwen3(?=[:@/-]|$)/i.test(model) ? { think: qwenNeedsReasoning(messages) } : {}),
        keep_alive: '5m',
        options: { temperature: 0.35, num_predict: 300 }
      }),
      signal: controller.signal
    })

    if (!response.ok) throw new Error(`Ollama respondió HTTP ${response.status}`)

    let reply = ''
    let modelStats: {
      total_duration?: number
      load_duration?: number
      prompt_eval_count?: number
      eval_count?: number
    } = {}

    if (onToken) {
      if (!response.body) throw new Error('Ollama no devolvió un flujo de respuesta')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      const consumeLine = (line: string) => {
        if (!line.trim()) return
        const chunk = JSON.parse(line) as {
          error?: string
          message?: { content?: string }
          done?: boolean
          total_duration?: number
          load_duration?: number
          prompt_eval_count?: number
          eval_count?: number
        }
        if (chunk.error) throw new Error(chunk.error)
        const content = chunk.message?.content || ''
        if (content) {
          if (firstTokenMs === null) firstTokenMs = Date.now() - startedAt
          reply += content
          onToken(content)
        }
        if (chunk.done) modelStats = chunk
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split(/\r?\n/)
          buffer = lines.pop() || ''
          for (const line of lines) consumeLine(line)
        }
        buffer += decoder.decode()
        if (buffer.trim()) consumeLine(buffer)
      } finally {
        reader.releaseLock()
      }
    } else {
      const data = await response.json() as {
        message?: { content?: string }
        total_duration?: number
        load_duration?: number
        prompt_eval_count?: number
        eval_count?: number
      }
      reply = data.message?.content || ''
      modelStats = data
    }

    reply = reply.trim()
    if (!reply) throw new Error('Ollama devolvió una respuesta vacía')
    console.info('[TELAR AI] ollama_ok', {
      model,
      durationMs: Date.now() - startedAt,
      firstTokenMs,
      modelDurationMs: modelStats.total_duration ? Math.round(modelStats.total_duration / 1_000_000) : null,
      loadDurationMs: modelStats.load_duration ? Math.round(modelStats.load_duration / 1_000_000) : null,
      promptTokenCount: modelStats.prompt_eval_count ?? null,
      replyTokenCount: modelStats.eval_count ?? null,
      replyChars: reply.length
    })
    return reply
  } finally {
    clearTimeout(timeout)
  }
}

async function generateWithOpenAI(messages: AIProviderMessage[], onToken?: (chunk: string) => void, options?: AIResponseOptions): Promise<string> {
  const { hasKey, model, apiKey } = getOpenAiConfig()
  if (!hasKey) throw new Error('OPENAI_API_KEY no está configurada')

  const client = new OpenAI({ apiKey, timeout: getProviderTimeoutMs() })
  const responseFormat = options?.responseFormat === 'json'
    ? { response_format: { type: 'json_object' as const } }
    : {}
  if (onToken) {
    const stream = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 300,
      temperature: 0.4,
      stream: true,
      ...responseFormat
    })
    let streamedReply = ''
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (typeof content !== 'string' || !content) continue
      streamedReply += content
      onToken(content)
    }
    const reply = streamedReply.trim()
    if (!reply) throw new Error('OpenAI devolvió una respuesta vacía')
    return reply
  }

  const response = await client.chat.completions.create({
    model,
    messages,
    max_tokens: 300,
    temperature: 0.4,
    ...responseFormat
  })
  const reply = response.choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error('OpenAI devolvió una respuesta vacía')
  return reply
}

async function readGeminiStream(body: ReadableStream<Uint8Array>, onToken: (chunk: string) => void): Promise<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let reply = ''
  const consumeEvent = (event: string) => {
    const data = event
      .split(/\r?\n/)
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trim())
      .join('\n')
    if (!data || data === '[DONE]') return
    const chunk = JSON.parse(data) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const content = chunk.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || ''
    if (!content) return
    reply += content
    onToken(content)
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split(/\r?\n\r?\n/)
      buffer = events.pop() || ''
      for (const event of events) consumeEvent(event)
    }
    buffer += decoder.decode()
    if (buffer.trim()) consumeEvent(buffer)
  } finally {
    reader.releaseLock()
  }

  const finalReply = reply.trim()
  if (!finalReply) throw new Error('Gemini devolvió una respuesta vacía')
  return finalReply
}

async function generateWithGemini(messages: AIProviderMessage[], onToken?: (chunk: string) => void, options?: AIResponseOptions): Promise<string> {
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
  const timeout = setTimeout(() => controller.abort(), getProviderTimeoutMs())
  const startedAt = Date.now()

  try {
    const action = onToken ? 'streamGenerateContent?alt=sse' : 'generateContent'
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:${action}`, {
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
        contents,
        generationConfig: {
          temperature: options?.responseFormat === 'json' ? 0.2 : 0.4,
          maxOutputTokens: 300,
          ...(options?.responseFormat === 'json' ? {
            responseFormat: {
              text: {
                mimeType: 'APPLICATION_JSON',
                ...(options.responseSchema ? { schema: options.responseSchema } : {})
              }
            }
          } : {})
        }
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

    let reply: string
    if (onToken) {
      if (!response.body) throw new Error('Gemini no devolvió un flujo de respuesta')
      reply = await readGeminiStream(response.body, onToken)
    } else {
      const data = await response.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      }
      reply = data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || '')
        .join('')
        .trim() || ''
    }
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

export async function generateAIResponse(messages: AIProviderMessage[], onToken?: (chunk: string) => void, options?: AIResponseOptions): Promise<string> {
  const provider = getConfiguredProvider()
  if (provider === 'ollama') return generateWithOllama(messages, onToken, options)
  if (provider === 'openai') return generateWithOpenAI(messages, onToken, options)
  if (provider === 'gemini') return generateWithGemini(messages, onToken, options)
  throw new Error('Proveedor configurado como fallback')
}
