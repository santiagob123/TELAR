import prisma from '../../lib/prisma'
import OpenAI from 'openai'

const OPENAI_KEY = process.env.OPENAI_API_KEY
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o'

const client = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null

/**
 * Busca coincidencias simples en la base de conocimiento o devuelve
 * un mensaje controlado de cortesía si no se encuentra información.
 */
function getKnowledgeFallback(
  kb: Array<{ title: string; content: string }>,
  messageText: string
): string {
  const clean = messageText.toLowerCase().replace(/[?¿!¡]/g, '')
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

  return 'No tengo información sobre eso en este momento. Te recomiendo contactar directamente con el equipo de TELAR para más detalles.'
}

/**
 * Genera la respuesta del asistente virtual TELAR AI.
 *
 * Responsabilidades:
 * 1. Cargar la base de conocimiento (KB) y el nombre del contexto.
 * 2. Cargar el historial conversacional ordenado cronológicamente (user y assistant),
 *    excluyendo el mensaje actual por su ID para evitar duplicación.
 * 3. Construir el prompt estructurado (system con directivas y KB, historial previo, y mensaje actual).
 * 4. Invocar a OpenAI de manera resiliente bajo try/catch.
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
  const kbText = kb.length > 0
    ? kb.map(k => `- ${k.title}: ${k.content}`).join('\n')
    : 'Sin información registrada en la Base de Conocimiento.'

  // 2. Construir directivas del sistema
  const systemPrompt = `Eres TELAR AI, el asistente virtual de ${businessName}.

Tu función es atender a los usuarios de manera clara, amable, breve y profesional.

Reglas obligatorias:
1. Responde ÚNICAMENTE utilizando la información disponible en la Base de Conocimiento y el contexto de la conversación.
2. NO inventes precios, horarios, servicios, ubicaciones, teléfonos ni información que no esté explícitamente en los datos disponibles.
3. Si no tienes la información o la pregunta no está cubierta, indícalo claramente de forma amable y recomienda contactar directamente con el equipo.
4. Mantén un tono natural, empático y profesional.
5. Sé conciso y directo en tus respuestas.

Base de Conocimiento disponible:
${kbText}`

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

  // 4. Si OpenAI no está configurado, ejecutar el fallback determinista de demostración
  if (!client) {
    return getKnowledgeFallback(kb, messageText)
  }

  // 5. Invocar al proveedor de IA con protección contra fallas
  try {
    const messagesForModel: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: messageText }
    ]

    const resp = await client.chat.completions.create({
      model: MODEL,
      messages: messagesForModel,
      max_tokens: 300
    })

    const reply = resp.choices?.[0]?.message?.content?.trim()
    if (reply) return reply

    return getKnowledgeFallback(kb, messageText)
  } catch (error: any) {
    // Registro seguro en servidor: solo mensaje de error, nunca API keys ni tokens
    console.error('[TELAR AI] Error al comunicarse con OpenAI:', error?.message || 'Error desconocido')
    // Degradación elegante: respuesta basada en Knowledge Base en vez de fallar con 500
    return getKnowledgeFallback(kb, messageText)
  }
}
