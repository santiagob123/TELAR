import { NextApiRequest, NextApiResponse } from 'next'
import { ConversationDateFilterError, getFilteredConversationPage } from '../../../lib/ai-conversations'
import { requireAiAccess } from '../../../lib/ai-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const access = await requireAiAccess(req, res)
  if (!access) return

  const pageValue = typeof req.query.page === 'string' ? Number(req.query.page) : 1
  const pageSizeValue = typeof req.query.pageSize === 'string' ? Number(req.query.pageSize) : 20
  if (!Number.isSafeInteger(pageValue) || pageValue < 1 || !Number.isSafeInteger(pageSizeValue) || pageSizeValue < 1 || pageSizeValue > 50) {
    return res.status(400).json({ error: 'Paginación inválida.' })
  }

  try {
    const conversations = await getFilteredConversationPage(
      access.isGlobalAdmin ? undefined : access.ownerId,
      typeof req.query.from === 'string' ? req.query.from : undefined,
      typeof req.query.to === 'string' ? req.query.to : undefined,
      pageValue,
      pageSizeValue
    )
    return res.json({ ...conversations, canDelete: access.isGlobalAdmin })
  } catch (error) {
    if (error instanceof ConversationDateFilterError) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'No se pudieron cargar las conversaciones.' })
  }
}
