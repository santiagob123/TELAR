import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { requireAiToken } from '../../../../lib/ai-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method === 'PATCH') {
    if (!requireAiToken(req, res)) return
    const { state } = req.body
    try {
      const updated = await prisma.conversation.update({ where: { id: String(id) }, data: { state } })
      return res.json(updated)
    } catch (e:any) {
      return res.status(500).json({ error: e.message })
    }
  }
  res.status(405).end()
}
