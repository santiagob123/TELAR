import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { requireAiAccess } from '../../../../lib/ai-auth'

const ALLOWED_STATES = new Set(['open', 'human'])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method !== 'PATCH' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'PATCH, DELETE')
    return res.status(405).end()
  }

  const access = await requireAiAccess(req, res)
  if (!access) return

  if (req.method === 'PATCH') {
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

  if (!access.isGlobalAdmin) {
    return res.status(403).json({ error: 'Solo el administrador global puede eliminar conversaciones.' })
  }
  if (req.body?.confirmation !== 'ELIMINAR') {
    return res.status(400).json({ error: 'Falta la confirmación explícita de eliminación.' })
  }
  if (typeof id !== 'string' || !id.trim()) {
    return res.status(400).json({ error: 'Identificador de conversación inválido.' })
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { id: true }
    })
    if (!conversation) return res.status(404).json({ error: 'No se encontró la conversación.' })

    await prisma.$transaction(async transaction => {
      await transaction.message.deleteMany({ where: { conversationId: conversation.id } })
      await transaction.conversation.delete({ where: { id: conversation.id } })
    })
    return res.status(204).end()
  } catch {
    console.error('[TELAR] Conversation deletion failed')
    return res.status(500).json({ error: 'No se pudo eliminar la conversación de TELAR.' })
  }
}
