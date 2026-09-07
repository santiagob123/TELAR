import { NextApiRequest, NextApiResponse } from 'next'
import { handleIncoming } from '../../../services/whatsapp'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).end()
  const { businessId, from, text } = req.body
  if (!businessId || !from || !text) return res.status(400).json({ error: 'Missing fields' })
  const out = await handleIncoming(businessId, from, text)
  return res.json(out)
}
