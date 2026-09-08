import prisma from '../../lib/prisma'
import { generateAIResponse, getAIProvider } from './provider'

const FALLBACK_REPLY = 'No tengo información sobre eso en este momento. Te recomiendo contactar directamente con el equipo de TELAR para más detalles.'

function normalizeKnowledgeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[?¿!¡]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isDirectKnowledgeQuestion(message: string, title: string) {
  if (!message.includes(title)) return false
  const remainder = message.replace(title, '').trim()
  return remainder === '' || /^(que es|que significa|quien es)$/.test(remainder)
}

function providerErrorDetails(error: unknown) {
  const err = error as { message?: string; status?: number; code?: string; error?: { message?: string; type?: string } }
  return {
    message: err?.error?.message || err?.message || 'Error desconocido',
    status: err?.status || null,
    code: err?.code || err?.error?.type || null
  }
}

/**
 * Busca coincidencias simples en la base de conocimiento o devuelve
 * un mensaje controlado de cortesía si no se encuentra información.
 */
function getKnowledgeFallback(
  kb: Array<{ title: string; content: string }>,
  messageText: string
): string {
  const clean = normalizeKnowledgeText(messageText)

  const exactTitleMatch = kb.find(item => clean.includes(normalizeKnowledgeText(item.title)))
  if (exactTitleMatch) return exactTitleMatch.content

  const words = clean.split(/\s+/).filter(w => w.length > 2)

  for (const item of kb) {
    const titleLower = item.title.toLowerCase()
    const contentLower = item.content.toLowerCase()

    for (const word of words) {
      if (titleLower.includes(word) || contentLower.includes(word)) {
        return item.content
      }
    }
  }

  return FALLBACK_REPLY
}

/**
 * Genera la respuesta del asistente virtual TELAR AI.
 *
 * Responsabilidades:
 * 1. Cargar la base de conocimiento (KB) y el nombre del contexto.
 * 2. Cargar el historial conversacional ordenado cronológicamente (user y assistant),
 *    excluyendo el mensaje actual por su ID para evitar duplicación.
 * 3. Construir el prompt estructurado (system con directivas y KB, historial previo, y mensaje actual).
 * 4. Invocar al proveedor configurado de manera resiliente bajo try/catch.
 * 5. Aplicar fallback a la Knowledge Base si OpenAI falla o no está configurado.
 */
export async function answerMessage(
  businessId: string,
  messageText: string,
  conversationId?: string,
  currentMessageId?: string
): Promise<string> {
  // 1. Cargar base de conocimiento y contexto
  const kb = await prisma.knowledgeBase.findMany({ where: { businessId } })
  const business = await prisma.business.findUnique({ where: { id: businessId } })

  const businessName = business?.name || 'TELAR AI'
  const kbContentChars = kb.reduce((sum, item) => sum + item.content.length + item.title.length, 0)
  const kbText = kb.length > 0
    ? kb.map(k => `- ${k.title}: ${k.content}`).join('\n')
    : 'Sin información registrada en la Base de Conocimiento.'
  const normalizedMessage = normalizeKnowledgeText(messageText)
  const directKnowledgeMatch = kb.find(item => normalizedMessage.includes(normalizeKnowledgeText(item.title)))
  const exactKnowledgeMatch = kb.find(item => isDirectKnowledgeQuestion(normalizedMessage, normalizeKnowledgeText(item.title)))
  const directKnowledgeInstruction = directKnowledgeMatch
    ? `\nBloque directamente relacionado con la pregunta: ${directKnowledgeMatch.title}: ${directKnowledgeMatch.content}`
    : ''

  // 2. Construir directivas del sistema
  const systemPrompt = `Eres TELAR AI, el asistente virtual de ${businessName}.

Tu función es atender a los usuarios de manera clara, amable, breve y profesional.

Reglas obligatorias:
1. Para preguntas específicas sobre TELAR, utiliza la Base de Conocimiento como fuente principal de verdad.
2. Si la pregunta coincide con el título de un bloque, prioriza ese bloque y no sustituyas su respuesta por otro bloque relacionado.
3. NO inventes precios, horarios, servicios, ubicaciones, teléfonos, clientes, integraciones ni funcionalidades de TELAR que no estén explícitamente en los datos disponibles.
4. Si una pregunta sobre TELAR requiere información que no está disponible, reconócelo claramente y recomienda contactar directamente con el equipo.
5. Puedes responder de forma natural a saludos y preguntas generales que no requieran afirmar datos específicos sobre TELAR.
6. Mantén un tono natural, empático, profesional, conciso y directo.

Base de Conocimiento disponible:
${kbText}${directKnowledgeInstruction}`

  // 3. Cargar historial cronológico previo si existe una conversación
  let history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  if (conversationId) {
    const allMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    })

    // Excluir el mensaje actual utilizando su identidad (id) o la última posición
    const previousMessages = currentMessageId
      ? allMessages.filter(m => m.id !== currentMessageId)
      : allMessages.slice(0, -1)

    // Tomar hasta los últimos 10 mensajes para dar contexto multi-turno suficiente
    const recentMessages = previousMessages.slice(-10)

    history = recentMessages.map(m => ({
      role: (m.isFromAI ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.text
    }))
  }

  console.info('[TELAR AI] diagnose', {
    provider: getAIProvider(),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
    openAiModel: process.env.OPENAI_MODEL || 'gpt-4o',
    businessId,
    businessName,
    kbExists: kb.length > 0,
    kbCount: kb.length,
    kbContentChars,
    historyCount: history.length,
    willCallProvider: getAIProvider() !== 'fallback'
  })

  // 4. El proveedor fallback usa la respuesta determinista basada en KnowledgeBase.
  if (getAIProvider() === 'fallback') {
    const fallback = getKnowledgeFallback(kb, messageText)
    console.info('[TELAR AI] fallback', { reason: 'configured_fallback', usedKeywordMatch: fallback !== FALLBACK_REPLY })
    return fallback
  }

  // 5. Invocar al proveedor de IA con protección contra fallas
  try {
    const messagesForModel: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: messageText }
    ]

    const provider = getAIProvider()
    console.info('[TELAR AI] provider_request', { provider, messageCount: messagesForModel.length })
    const reply = await generateAIResponse(messagesForModel)
    if (exactKnowledgeMatch) {
      console.info('[TELAR AI] provider_ok', { provider, replyChars: reply.length, usedExactKnowledge: true })
      return exactKnowledgeMatch.content
    }
    console.info('[TELAR AI] provider_ok', { provider, replyChars: reply.length })
    return reply
  } catch (error: unknown) {
    const provider = getAIProvider()
    const details = providerErrorDetails(error)
    console.error(`[TELAR AI] ${provider}_error`, details)
    if (exactKnowledgeMatch) {
      console.info('[TELAR AI] fallback', { reason: `${provider}_exception`, usedExactKnowledge: true })
      return exactKnowledgeMatch.content
    }
    const fallback = getKnowledgeFallback(kb, messageText)
    console.info('[TELAR AI] fallback', { reason: `${provider}_exception`, usedKeywordMatch: fallback !== FALLBACK_REPLY })
    return fallback
  }
}
