import { NextApiRequest, NextApiResponse } from 'next'
import { hasValidAdminSession } from './admin-session'
import prisma from './prisma'

export function requireAdminToken(req: NextApiRequest, res: NextApiResponse) {
  const configuredToken = process.env.ADMIN_TOKEN

  if (hasValidAdminSession(req.cookies.telar_admin_session)) return true

  if (configuredToken && req.headers['x-admin-token'] === configuredToken) return true

  res.status(401).json({ error: 'Unauthorized' })
  return false
}

export async function requireAdminUser(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminToken(req, res)) return null

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

  return user.id
}