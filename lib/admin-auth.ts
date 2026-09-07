import { NextApiRequest, NextApiResponse } from 'next'
import { hasValidAdminSession } from './admin-session'

export function requireAdminToken(req: NextApiRequest, res: NextApiResponse) {
  const configuredToken = process.env.ADMIN_TOKEN

  if (hasValidAdminSession(req.cookies.telar_admin_session)) return true

  if (configuredToken && req.headers['x-admin-token'] === configuredToken) return true

  res.status(401).json({ error: 'Unauthorized' })
  return false
}