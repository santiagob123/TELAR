import { NextApiRequest, NextApiResponse } from 'next'
import { ADMIN_SESSION_COOKIE, createAdminSession } from '../../../lib/admin-session'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const configuredToken = process.env.ADMIN_TOKEN
  if (!configuredToken) {
    res.status(process.env.NODE_ENV === 'production' ? 503 : 400).json({
      error: process.env.NODE_ENV === 'production'
        ? 'La administración no está configurada.'
        : 'ADMIN_TOKEN no está configurado.'
    })
    return
  }

  const token = typeof req.body?.token === 'string' ? req.body.token : ''
  if (token !== configuredToken) {
    res.status(401).json({ error: 'Token inválido.' })
    return
  }

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=${createAdminSession(configuredToken)}; Path=/; HttpOnly; SameSite=Lax${secure}`)
  res.status(204).end()
}