import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'crypto'
import { requireAiAccess } from '../../../lib/ai-auth'
import { getAIContext } from '../../../services/ai/context'
import prisma from '../../../lib/prisma'

const MAX_TITLE_LENGTH = 120
const MAX_CONTENT_LENGTH = 12000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const access = await requireAiAccess(req, res)
  if (!access) return

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    if (req.method === 'GET') {
      if (access.isGlobalAdmin) {
        const entries = await prisma.$queryRaw<Array<{ id: string; title: string; content: string; isEditable: boolean; businessId: string; businessName: string; ownerEmail: string | null }>>`
          SELECT kb."id", kb."title", kb."content", kb."isEditable", kb."businessId",
            b."name" AS "businessName", u."email" AS "ownerEmail"
          FROM "KnowledgeBase" kb
          JOIN "Business" b ON b."id" = kb."businessId"
          LEFT JOIN "User" u ON u."id" = b."ownerId"
          ORDER BY b."name" ASC, kb."isEditable" ASC, kb."title" ASC
        `
        return res.status(200).json({ globalAdmin: true, entries })
      }
      const context = await getAIContext(access.ownerId)
      const entries = await prisma.$queryRaw<Array<{ id: string; title: string; content: string; isEditable: boolean; businessId: string; businessName: string }>>`
        SELECT kb."id", kb."title", kb."content", kb."isEditable", kb."businessId", b."name" AS "businessName"
        FROM "KnowledgeBase" kb JOIN "Business" b ON b."id" = kb."businessId"
        WHERE kb."businessId" = ${context.id}
        ORDER BY kb."isEditable" ASC, kb."title" ASC
      `
      return res.status(200).json({ globalAdmin: false, entries: entries.map(entry => ({ ...entry, businessId: context.id, businessName: context.name })) })
    }
    if (access.isGlobalAdmin) return res.status(403).json({ error: 'La vista global de Knowledge Base es de solo lectura.' })
    const context = await getAIContext(access.ownerId)

    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : ''
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : ''
    if (!title || title.length > MAX_TITLE_LENGTH || !content || content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ error: 'El título debe tener hasta 120 caracteres y el contenido hasta 12000.' })
    }

    const duplicate = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "KnowledgeBase" WHERE "businessId" = ${context.id} AND LOWER("title") = LOWER(${title}) LIMIT 1
    `
    if (duplicate.length) return res.status(409).json({ error: 'Ya existe una entrada con ese título.' })

    const created = await prisma.$queryRaw<Array<{ id: string; title: string; content: string; isEditable: boolean }>>`
      INSERT INTO "KnowledgeBase" ("id", "businessId", "title", "content", "isEditable")
      VALUES (${randomUUID()}, ${context.id}, ${title}, ${content}, true)
      RETURNING "id", "title", "content", "isEditable"
    `
    return res.status(201).json(created[0])
  } catch (error) {
    console.error('Knowledge API error:', error instanceof Error ? error.message : 'Error desconocido')
    return res.status(503).json({ error: 'No se pudo cargar la base de conocimiento.' })
  }
}
