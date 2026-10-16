import { NextApiRequest, NextApiResponse } from 'next'
import { hasValidAiSession } from './ai-session'
import { hasValidAdminSession } from './admin-session'
import prisma from './prisma'
import { verifyUserSession } from './user-session'

function hasValidAiAuthorization(req: NextApiRequest) {
  const configuredToken = process.env.AI_TOKEN
  if (hasValidAiSession(req.cookies.telar_ai_session)) return true
  return Boolean(configuredToken && req.headers['x-ai-token'] === configuredToken)
}

function hasValidAdminAuthorization(req: NextApiRequest) {
  const configuredToken = process.env.ADMIN_TOKEN
  if (hasValidAdminSession(req.cookies.telar_admin_session)) return true
  return Boolean(configuredToken && req.headers['x-admin-token'] === configuredToken)
}

export function requireAiToken(req: NextApiRequest, res: NextApiResponse) {
  if (hasValidAiAuthorization(req) || hasValidAdminAuthorization(req)) return true
  res.status(401).json({ error: 'Unauthorized' })
  return false
}

export type AiAccess = { ownerId: string; isGlobalAdmin: boolean }

export async function requireAiAccess(req: NextApiRequest, res: NextApiResponse): Promise<AiAccess | null> {
  try {
    const session = verifyUserSession(req.cookies.telar_user_session)
    if (session) {
      const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true } })
      if (user) {
        const configuredAdminId = process.env.ADMIN_USER_ID?.trim()
        return { ownerId: user.id, isGlobalAdmin: Boolean(configuredAdminId && user.id === configuredAdminId) }
      }
    }
    const aiAuthorized = hasValidAiAuthorization(req)
    const adminAuthorized = hasValidAdminAuthorization(req)
    if (!aiAuthorized && !adminAuthorized) {
      res.status(401).json({ error: 'Unauthorized' })
      return null
    }

    const isGlobalAdmin = adminAuthorized
    const userId = (isGlobalAdmin ? process.env.ADMIN_USER_ID : process.env.AI_USER_ID)?.trim()
    if (!userId) {
      res.status(503).json({ error: isGlobalAdmin
        ? 'La identidad administrativa no está configurada.'
        : 'La identidad de TELAR AI no está configurada.' })
      return null
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!user) {
      res.status(503).json({ error: isGlobalAdmin
        ? 'La identidad administrativa no es válida.'
        : 'La identidad de TELAR AI no es válida.' })
      return null
    }

    return { ownerId: user.id, isGlobalAdmin }
  } catch (error) {
    console.error('[TELAR] AI authorization lookup failed', error instanceof Error ? error.message : 'unknown error')
    if (!res.headersSent) res.status(503).json({ error: 'No se pudo validar la sesión. Revisa la conexión con la base de datos.' })
    return null
  }
}

export async function requireAiUser(req: NextApiRequest, res: NextApiResponse) {
  const access = await requireAiAccess(req, res)
  return access?.ownerId || null
}
