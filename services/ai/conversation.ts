import prisma from '../../lib/prisma'
import { answerMessage } from './index'

/**
 * Orquesta la recepción de un mensaje y el ciclo de vida de una conversación en TELAR AI.
 * 1. Identifica o crea la conversación activa (state: 'open') para el remitente dado.
 * 2. Persiste el mensaje del usuario en la base de datos.
 * 3. Solicita la respuesta al servicio de IA (answerMessage).
 * 4. Persiste la respuesta del asistente en la conversación.
 * 5. Retorna la conversación y la respuesta generada.
 */
export async function handleIncoming(businessId: string, from: string, text: string) {
  const normalizedText = text.trim()

  // 1. Buscar conversación abierta existente o crear una nueva
  let conv = await prisma.conversation.findFirst({
    where: {
      businessId,
      from,
      state: 'open'
    }
  })

  if (!conv) {
    conv = await prisma.conversation.create({
      data: {
        businessId,
        from
      }
    })
  }

  // 2. Persistir mensaje entrante del usuario
  const userMsg = await prisma.message.create({
    data: {
      conversationId: conv.id,
      from,
      text: normalizedText,
      isFromAI: false
    }
  })

  // 3. Generar la respuesta de IA pasando la identidad exacta del mensaje actual
  const aiReply = await answerMessage(businessId, normalizedText, conv.id, userMsg.id)

  // 4. Persistir la respuesta del asistente
  await prisma.message.create({
    data: {
      conversationId: conv.id,
      from: 'agent',
      text: aiReply,
      isFromAI: true
    }
  })

  return { conv, aiReply }
}
