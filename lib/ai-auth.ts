import { NextApiRequest, NextApiResponse } from 'next'
import { hasValidAiSession } from './ai-session'

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
