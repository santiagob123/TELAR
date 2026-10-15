import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../../lib/prisma'
import { requireAiAccess } from '../../../../../lib/ai-auth'

const MAX_MESSAGE_LENGTH = 2000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).end()
  }

  const access = await requireAiAccess(req, res)
  if (!access) return

  const { id } = req.query
  if (req.method === 'GET') {
    const beforeAt = typeof req.query.beforeAt === 'string' ? new Date(req.query.beforeAt) : null
    const beforeId = typeof req.query.beforeId === 'string' ? req.query.beforeId : ''
    if (!beforeAt || Number.isNaN(beforeAt.getTime()) || !beforeId) {
      return res.status(400).json({ error: 'Cursor de mensajes inválido.' })
    }
    try {
      const conversation = await prisma.conversation.findFirst({
        where: { id: String(id), ...(access.isGlobalAdmin ? {} : { business: { ownerId: access.ownerId } }) },
        select: { id: true }
      })
      if (!conversation) return res.status(404).json({ error: 'Not found' })

      const rows = await prisma.message.findMany({
        where: {
          conversationId: conversation.id,
          OR: [
            { createdAt: { lt: beforeAt } },
            { createdAt: beforeAt, id: { lt: beforeId } }
          ]
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 51
      })
      const hasMore = rows.length > 50
      const items = rows.slice(0, 50).reverse()
      return res.status(200).json({ items, hasMore })
    } catch (error) {
      console.error('Load older messages error:', error instanceof Error ? error.message : 'Error desconocido')
      return res.status(500).json({ error: 'No se pudieron cargar mensajes anteriores.' })
    }
  }

  const { text } = req.body || {}
  const normalizedText = typeof text === 'string' ? text.trim() : ''

  if (typeof text !== 'string' || !normalizedText || normalizedText.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: 'El mensaje debe tener entre 1 y 2000 caracteres.' })
  }

  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: String(id), ...(access.isGlobalAdmin ? {} : { business: { ownerId: access.ownerId } }) },
      select: { id: true, state: true }
    })

    if (!conversation) return res.status(404).json({ error: 'Not found' })
    if (conversation.state !== 'human') {
      return res.status(409).json({ error: 'La conversación no está en atención humana.' })
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        from: 'human',
        text: normalizedText,
        isFromAI: false
      },
      select: {
        id: true,
        conversationId: true,
        from: true,
        text: true,
        isFromAI: true,
        createdAt: true
      }
    })

    return res.status(200).json(message)
  } catch (error) {
    console.error('Human message API error:', error instanceof Error ? error.message : 'Error desconocido')
    return res.status(500).json({ error: 'No se pudo guardar el mensaje.' })
  }
}
