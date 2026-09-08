import { NextApiRequest, NextApiResponse } from 'next'
import { handleIncoming } from '../../../services/ai/conversation'
import { requireAiToken } from '../../../lib/ai-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!requireAiToken(req, res)) return

  const { businessId, from, text } = req.body || {}

  if (
    typeof businessId !== 'string' || !businessId.trim() ||
    typeof from !== 'string' || !from.trim() ||
    typeof text !== 'string' || !text.trim()
  ) {
    return res.status(400).json({ error: 'Campos requeridos: businessId, from y text válidos.' })
  }

  try {
    const out = await handleIncoming(businessId.trim(), from.trim(), text.trim())
    return res.json(out)
  } catch (error) {
    console.error('AI message API error:', error instanceof Error ? error.message : 'Error desconocido')
    return res.status(500).json({ error: 'No se pudo procesar el mensaje.' })
  }
}
