import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAiAccess } from '../../../../lib/ai-auth'
import { getAIContext } from '../../../../services/ai/context'
import prisma from '../../../../lib/prisma'

const MAX_TITLE_LENGTH = 120
const MAX_CONTENT_LENGTH = 12000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const access = await requireAiAccess(req, res)
  if (!access) return
  if (access.isGlobalAdmin) return res.status(403).json({ error: 'La vista global de Knowledge Base es de solo lectura.' })

  if (req.method !== 'PATCH' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'PATCH, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const id = typeof req.query.id === 'string' ? req.query.id : ''
  if (!id) return res.status(400).json({ error: 'ID inválido.' })

  try {
    const context = await getAIContext(access.ownerId)
    const existing = await prisma.$queryRaw<Array<{ id: string; isEditable: boolean }>>`
      SELECT "id", "isEditable" FROM "KnowledgeBase"
      WHERE "id" = ${id} AND "businessId" = ${context.id} LIMIT 1
    `
    if (!existing[0]) return res.status(404).json({ error: 'Entrada no encontrada.' })
    if (!existing[0].isEditable) return res.status(403).json({ error: 'Las entradas base del sistema son de solo lectura.' })

    if (req.method === 'DELETE') {
      await prisma.$executeRaw`DELETE FROM "KnowledgeBase" WHERE "id" = ${id} AND "businessId" = ${context.id} AND "isEditable" = true`
      return res.status(204).end()
    }

    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : ''
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : ''
    if (!title || title.length > MAX_TITLE_LENGTH || !content || content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ error: 'El título debe tener hasta 120 caracteres y el contenido hasta 12000.' })
    }

    const duplicate = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "KnowledgeBase"
      WHERE "businessId" = ${context.id} AND LOWER("title") = LOWER(${title}) AND "id" <> ${id} LIMIT 1
    `
    if (duplicate.length) return res.status(409).json({ error: 'Ya existe otra entrada con ese título.' })

    const updated = await prisma.$queryRaw<Array<{ id: string; title: string; content: string; isEditable: boolean }>>`
      UPDATE "KnowledgeBase" SET "title" = ${title}, "content" = ${content}
      WHERE "id" = ${id} AND "businessId" = ${context.id} AND "isEditable" = true
      RETURNING "id", "title", "content", "isEditable"
    `
    if (!updated[0]) return res.status(404).json({ error: 'Entrada no encontrada.' })
    return res.status(200).json(updated[0])
  } catch (error) {
    console.error('Knowledge item API error:', error instanceof Error ? error.message : 'Error desconocido')
    return res.status(503).json({ error: 'No se pudo actualizar la base de conocimiento.' })
  }
}
