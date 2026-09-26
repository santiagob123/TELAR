import { NextApiRequest, NextApiResponse } from 'next'
import { handleIncoming } from '../../../services/ai/conversation'
import { requireAiUser } from '../../../lib/ai-auth'
import { getAIContext } from '../../../services/ai/context'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const ownerId = await requireAiUser(req, res)
  if (!ownerId) return

  const { from, text } = req.body || {}

  if (
    typeof from !== 'string' || !from.trim() ||
    typeof text !== 'string' || !text.trim()
  ) {
    return res.status(400).json({ error: 'Campos requeridos: from y text válidos.' })
  }

  try {
    const business = await getAIContext(ownerId)
    const out = await handleIncoming(business.id, from.trim(), text.trim())
    return res.json(out)
  } catch (error) {
    console.error('AI message API error:', error instanceof Error ? error.message : 'Error desconocido')
    return res.status(500).json({ error: 'No se pudo procesar el mensaje.' })
  }
}
