import { NextApiRequest, NextApiResponse } from 'next'
import { createProfileAndTag } from '../../../services/tag'
import { requireAdminToken } from '../../../lib/admin-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    if (!requireAdminToken(req, res)) return
    const data = req.body
    try {
      const result = await createProfileAndTag(data)
      return res.status(201).json(result)
    } catch (e:any) {
      if (e?.code === 'VALIDATION_ERROR') return res.status(400).json({ error: e.message })
      if (e?.code === 'CONFLICT') return res.status(409).json({ error: e.message })
      return res.status(500).json({ error: 'Error interno del servidor.' })
    }
  }
  res.status(405).end()
}
