import type { Conversation } from '@prisma/client'
import { randomUUID } from 'crypto'
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
export async function handleIncoming(
  businessId: string,
  from: string,
  text: string,
  idempotencyKey?: string
): Promise<
  | { conv: Conversation; aiReply: string; handedOff: false }
  | { conv: Conversation; aiReply: null; handedOff: true }
> {
  const normalizedText = text.trim()
  let conv: Conversation | null = null
  let humanConversation = false
  let inboundMessage: { id: string; conversationId: string } | null = null

  if (idempotencyKey) {
    const previousMessages = await prisma.$queryRaw<Array<{ id: string; conversationId: string }>>`
      SELECT "id", "conversationId" FROM "Message"
      WHERE "idempotencyKey" = ${idempotencyKey} AND "isFromAI" = false
      LIMIT 1
    `
    inboundMessage = previousMessages[0] || null
    if (inboundMessage) {
      conv = await prisma.conversation.findUnique({ where: { id: inboundMessage.conversationId } })
      if (!conv) throw new Error('La conversación del mensaje idempotente no existe.')

      const previousReplies = await prisma.$queryRaw<Array<{ text: string }>>`
        SELECT "text" FROM "Message" WHERE "idempotencyKey" = ${`${idempotencyKey}:reply`} LIMIT 1
      `
      const previousReply = previousReplies[0]
      if (previousReply) return { conv, aiReply: previousReply.text, handedOff: false }
      humanConversation = conv.state === 'human'
    }
  }

  // 1. Priorizar una conversación que ya está en manos de una persona.
  const activeHumanConversation = conv || await prisma.conversation.findFirst({
    where: {
      businessId,
      from,
      state: 'human'
    },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Si no hay handoff, reutilizar la conversación AI abierta más reciente.
  conv = activeHumanConversation
  humanConversation = Boolean(activeHumanConversation && activeHumanConversation.state === 'human')
  if (!conv) {
    conv = await prisma.conversation.findFirst({
      where: {
        businessId,
        from,
        state: 'open'
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // 3. Crear una conversación si no existe una abierta ni una derivada.
  if (!conv) {
    conv = await prisma.conversation.create({
      data: {
        businessId,
        from
      }
    })
  }

  // 4. Persistir el mensaje entrante sin alterar el remitente del canal.
  if (!inboundMessage) {
    if (idempotencyKey) {
      const inserted = await prisma.$queryRaw<Array<{ id: string; conversationId: string }>>`
        INSERT INTO "Message" ("id", "conversationId", "from", "text", "isFromAI", "idempotencyKey")
        VALUES (${randomUUID()}, ${conv.id}, ${from}, ${normalizedText}, false, ${idempotencyKey})
        ON CONFLICT ("idempotencyKey") DO NOTHING
        RETURNING "id", "conversationId"
      `
      const existing = inserted[0] ? inserted : await prisma.$queryRaw<Array<{ id: string; conversationId: string }>>`
        SELECT "id", "conversationId" FROM "Message" WHERE "idempotencyKey" = ${idempotencyKey} LIMIT 1
      `
      inboundMessage = existing[0] || null
      if (!inboundMessage) throw new Error('No se pudo persistir el mensaje idempotente.')
    } else {
      const created = await prisma.message.create({
        data: { conversationId: conv.id, from, text: normalizedText, isFromAI: false }
      })
      inboundMessage = { id: created.id, conversationId: created.conversationId }
    }
  }

  if (humanConversation) {
    return { conv, aiReply: null, handedOff: true }
  }

  // 5. Generar la respuesta de IA pasando la identidad exacta del mensaje actual.
  const aiReply = await answerMessage(businessId, normalizedText, conv.id, inboundMessage.id)

  // 6. Persistir la respuesta del asistente.
  if (idempotencyKey) {
    const replyKey = `${idempotencyKey}:reply`
    const insertedReply = await prisma.$queryRaw<Array<{ text: string }>>`
      INSERT INTO "Message" ("id", "conversationId", "from", "text", "isFromAI", "idempotencyKey")
      VALUES (${randomUUID()}, ${conv.id}, 'agent', ${aiReply}, true, ${replyKey})
      ON CONFLICT ("idempotencyKey") DO NOTHING
      RETURNING "text"
    `
    if (insertedReply.length === 0) {
      const previousReplies = await prisma.$queryRaw<Array<{ text: string }>>`
        SELECT "text" FROM "Message" WHERE "idempotencyKey" = ${replyKey} LIMIT 1
      `
      return { conv, aiReply: previousReplies[0]?.text || aiReply, handedOff: false }
    }
  } else {
    await prisma.message.create({ data: { conversationId: conv.id, from: 'agent', text: aiReply, isFromAI: true } })
  }

  return { conv, aiReply, handedOff: false }
}
