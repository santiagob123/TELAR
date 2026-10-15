import type { NextApiRequest, NextApiResponse } from 'next'
import { Prisma } from '@prisma/client'
import { requireAdminAccess } from '../../../lib/admin-auth'
import prisma from '../../../lib/prisma'

type DashboardCounts = {
  businesses: number
  profiles: number
  tags: number
  activeTags: number
  conversations: number
  humanConversations: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const access = await requireAdminAccess(req, res)
    if (!access) return
    const ownerFilter = access.isGlobalAdmin
      ? Prisma.empty
      : Prisma.sql`AND b."ownerId" = ${access.ownerId}`

    const rows = await prisma.$queryRaw<DashboardCounts[]>`
      SELECT
        (SELECT COUNT(*)::int FROM "Business" b WHERE TRUE ${ownerFilter}) AS "businesses",
        (SELECT COUNT(*)::int FROM "DigitalProfile" p JOIN "Business" b ON b."id" = p."businessId" WHERE TRUE ${ownerFilter}) AS "profiles",
        (SELECT COUNT(*)::int FROM "Tag" t JOIN "DigitalProfile" p ON p."id" = t."profileId" JOIN "Business" b ON b."id" = p."businessId" WHERE TRUE ${ownerFilter}) AS "tags",
        (SELECT COUNT(*)::int FROM "Tag" t JOIN "DigitalProfile" p ON p."id" = t."profileId" JOIN "Business" b ON b."id" = p."businessId" WHERE t."status" = 'active' ${ownerFilter}) AS "activeTags",
        (SELECT COUNT(*)::int FROM "Conversation" c JOIN "Business" b ON b."id" = c."businessId" WHERE TRUE ${ownerFilter}) AS "conversations",
        (SELECT COUNT(*)::int FROM "Conversation" c JOIN "Business" b ON b."id" = c."businessId" WHERE c."state" = 'human' ${ownerFilter}) AS "humanConversations"
    `

    return res.status(200).json(rows[0] || {
      businesses: 0, profiles: 0, tags: 0, activeTags: 0, conversations: 0, humanConversations: 0
    })
  } catch (error) {
    console.error('[TELAR] dashboard summary failed', error instanceof Error ? error.message : 'unknown error')
    if (!res.headersSent) return res.status(503).json({ error: 'No se pudieron cargar los indicadores del panel.' })
  }
}
