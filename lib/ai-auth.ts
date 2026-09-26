import { NextApiRequest, NextApiResponse } from 'next'
import { hasValidAiSession } from './ai-session'
import prisma from './prisma'

function hasValidAiAuthorization(req: NextApiRequest) {
  const configuredToken = process.env.AI_TOKEN
  if (hasValidAiSession(req.cookies.telar_ai_session)) return true
  return Boolean(configuredToken && req.headers['x-ai-token'] === configuredToken)
}

export function requireAiToken(req: NextApiRequest, res: NextApiResponse) {
  if (hasValidAiAuthorization(req)) return true
  res.status(401).json({ error: 'Unauthorized' })
  return false
}

export async function requireAiUser(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAiToken(req, res)) return null

  const userId = process.env.AI_USER_ID?.trim()
  if (!userId) {
    res.status(503).json({ error: 'La identidad de TELAR AI no está configurada.' })
    return null
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (!user) {
    res.status(503).json({ error: 'La identidad de TELAR AI no es válida.' })
    return null
  }

  return user.id
}
