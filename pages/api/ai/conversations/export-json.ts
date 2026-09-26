import { NextApiRequest, NextApiResponse } from 'next'
import { ConversationDateFilterError, getFilteredConversations } from '../../../../lib/ai-conversations'
import { requireAiUser } from '../../../../lib/ai-auth'

function getFilename(from?: string, to?: string) {
  if (from && to) return `telar-ai-conversations-${from}-to-${to}.json`
  if (from) return `telar-ai-conversations-from-${from}.json`
  if (to) return `telar-ai-conversations-to-${to}.json`
  return 'telar-ai-conversations.json'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ownerId = await requireAiUser(req, res)
  if (!ownerId) return

  const from = typeof req.query.from === 'string' ? req.query.from : undefined
  const to = typeof req.query.to === 'string' ? req.query.to : undefined

  try {
    const conversations = await getFilteredConversations(ownerId, from, to)
    const payload = {
      exportedAt: new Date().toISOString(),
      filters: { from: from || null, to: to || null },
      conversationCount: conversations.length,
      conversations: conversations.map(conversation => ({
        conversationId: conversation.id,
        createdAt: conversation.createdAt.toISOString(),
        lastActivityAt: conversation.lastActivityAt.toISOString(),
        messages: conversation.messages.map(message => ({
          role: message.isFromAI ? 'assistant' : 'user',
          createdAt: message.createdAt.toISOString(),
          content: message.text
        }))
      }))
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${getFilename(from, to)}"`)
    return res.status(200).send(JSON.stringify(payload, null, 2))
  } catch (error) {
    if (error instanceof ConversationDateFilterError) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'No se pudieron exportar las conversaciones.' })
  }
}