import { NextApiRequest, NextApiResponse } from 'next'
import { ConversationDateFilterError, getFilteredConversations } from '../../../lib/ai-conversations'
import { requireAiUser } from '../../../lib/ai-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const ownerId = await requireAiUser(req, res)
  if (!ownerId) return

  try {
    const conversations = await getFilteredConversations(
      ownerId,
      typeof req.query.from === 'string' ? req.query.from : undefined,
      typeof req.query.to === 'string' ? req.query.to : undefined
    )
    return res.json(conversations)
  } catch (error) {
    if (error instanceof ConversationDateFilterError) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'No se pudieron cargar las conversaciones.' })
  }
}
