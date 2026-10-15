import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { requireAiAccess } from '../../../../lib/ai-auth'

const ALLOWED_STATES = new Set(['open', 'human'])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method === 'PATCH') {
    const access = await requireAiAccess(req, res)
    if (!access) return
    const { state } = req.body
    if (typeof state !== 'string' || !ALLOWED_STATES.has(state)) {
      return res.status(400).json({ error: 'Estado de conversación inválido.' })
    }
    try {
      const conversation = await prisma.conversation.findFirst({
        where: { id: String(id), ...(access.isGlobalAdmin ? {} : { business: { ownerId: access.ownerId } }) },
        select: { id: true }
      })
      if (!conversation) return res.status(404).json({ error: 'Not found' })
      const updated = await prisma.conversation.update({ where: { id: conversation.id }, data: { state } })
      return res.json(updated)
    } catch (e:any) {
      return res.status(500).json({ error: e.message })
    }
  }
  res.status(405).end()
}
