import prisma from '../../lib/prisma'
import OpenAI from 'openai'

const OPENAI_KEY = process.env.OPENAI_API_KEY
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o'

const client = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null

export async function answerMessage(businessId: string, messageText: string, conversationId?: string) {
  // Load knowledge base
  const kb = await prisma.knowledgeBase.findMany({ where: { businessId } })
  const business = await prisma.business.findUnique({ where: { id: businessId } })

  const system = `Eres TELAR AI, el asistente virtual de ${business?.name || 'este negocio'}.

Tu función es atender a los clientes de manera clara, amable, breve y profesional.

Responde ÚNICAMENTE utilizando la información disponible en la Knowledge Base y el contexto de la conversación.

NO inventes precios, horarios, servicios, ubicaciones, teléfonos ni información que no esté en los datos disponibles.

Si no tienes la información, indícalo claramente y recomienda contactar directamente con el negocio.

Mantén un tono natural, profesional y amable.

Sé conciso.`
  
  const kbText = kb.length > 0 
    ? kb.map(k => `${k.title}:\n${k.content}`).join('\n\n')
    : 'Sin información disponible en la Knowledge Base'

  const prompt = `Información del negocio disponible:\n\n${kbText}\n\nPregunta del cliente: ${messageText}`

  if (!client) {
    // DEMO mode: search KB for relevant information
    const messageText_clean = messageText.toLowerCase().replace(/[?¿!¡]/g, '')
    const messageWords = messageText_clean.split(/\s+/).filter(w => w.length > 2)
    
    // Try to find matching KB item
    for (const item of kb) {
      const titleLower = item.title.toLowerCase()
      const contentLower = item.content.toLowerCase()
      
      // Check if any word from message matches title or content
      for (const word of messageWords) {
        if (titleLower.includes(word) || contentLower.includes(word)) {
          return item.content
        }
      }
    }
    
    // If no KB match found, return honest fallback
    return 'No tengo información sobre eso en este momento. Te recomiendo contactar directamente con el negocio para confirmarlo.'
  }

  // Load conversation history if available
  let history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  if (conversationId) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    })
    
    // Filter out the current message to avoid duplication
    // Keep only previous messages for context
    const previousMessages = messages.filter(m => m.text !== messageText && !m.isFromAI)
    
    // Take last 5 previous user messages for context
    const contextMessages = previousMessages.slice(-5)
    
    history = contextMessages.map(m => ({
      role: m.isFromAI ? 'assistant' : 'user',
      content: m.text
    }))
  }

  const resp = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      ...history,
      { role: 'user', content: prompt }
    ],
    max_tokens: 300
  })

  const text = resp.choices?.[0]?.message?.content ?? 'Lo siento, no pude generar una respuesta.'
  return text
}
