import prisma from '../../lib/prisma'
import { answerMessage } from '../ai'

export const MODE = process.env.WHATSAPP_MODE || 'demo'

export async function handleIncoming(businessId: string, from: string, text: string) {
  // Find existing open conversation or create new one
  let conv = await prisma.conversation.findFirst({
    where: {
      businessId,
      from,
      state: 'open'
    }
  })

  if (!conv) {
    conv = await prisma.conversation.create({ data: { businessId, from } })
  }

  await prisma.message.create({ data: { conversationId: conv.id, from, text, isFromAI: false } })

  const aiReply = await answerMessage(businessId, text, conv.id)
  await prisma.message.create({ data: { conversationId: conv.id, from: 'agent', text: aiReply, isFromAI: true } })
  return { conv, aiReply }
}
