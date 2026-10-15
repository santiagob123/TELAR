import { NextApiRequest, NextApiResponse } from 'next'
import { hasValidAdminSession } from './admin-session'
import prisma from './prisma'
import { verifyUserSession } from './user-session'

export function requireAdminToken(req: NextApiRequest, res: NextApiResponse) {
  const configuredToken = process.env.ADMIN_TOKEN

  if (hasValidAdminSession(req.cookies.telar_admin_session)) return true

  if (configuredToken && req.headers['x-admin-token'] === configuredToken) return true

  res.status(401).json({ error: 'Unauthorized' })
  return false
}

function hasAdminTokenAuthorization(req: NextApiRequest) {
  const configuredToken = process.env.ADMIN_TOKEN
  if (hasValidAdminSession(req.cookies.telar_admin_session)) return true
  return Boolean(configuredToken && req.headers['x-admin-token'] === configuredToken)
}

export type AdminAccess = { ownerId: string; isGlobalAdmin: boolean }

export async function requireAdminAccess(req: NextApiRequest, res: NextApiResponse): Promise<AdminAccess | null> {
  const session = verifyUserSession(req.cookies.telar_user_session)
  if (session) {
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true } })
    if (user) return { ownerId: user.id, isGlobalAdmin: false }
  }
  if (!hasAdminTokenAuthorization(req)) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }

  const userId = process.env.ADMIN_USER_ID?.trim()
  if (!userId) {
    res.status(503).json({ error: 'La identidad administrativa no está configurada.' })
    return null
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (!user) {
    res.status(503).json({ error: 'La identidad administrativa no es válida.' })
    return null
  }

  return { ownerId: user.id, isGlobalAdmin: true }
}

export async function requireAdminUser(req: NextApiRequest, res: NextApiResponse) {
  const access = await requireAdminAccess(req, res)
  return access?.ownerId || null
}
