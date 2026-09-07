import { NextApiRequest, NextApiResponse } from 'next'
import { handleIncoming } from '../../../services/whatsapp'
import { requireAiToken } from '../../../lib/ai-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).end()
  if (!requireAiToken(req, res)) return
  const { businessId, from, text } = req.body
  if (!businessId || !from || !text) return res.status(400).json({ error: 'Missing fields' })
  const out = await handleIncoming(businessId, from, text)
  return res.json(out)
}
