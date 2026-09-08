import { NextApiRequest, NextApiResponse } from 'next'
import { AI_SESSION_COOKIE, createAiSession } from '../../../lib/ai-session'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const configuredToken = process.env.AI_TOKEN
  if (!configuredToken) {
    res.status(process.env.NODE_ENV === 'production' ? 503 : 400).json({
      error: process.env.NODE_ENV === 'production'
        ? 'TELAR AI no está configurado.'
        : 'AI_TOKEN no está configurado.'
    })
    return
  }

  const token = typeof req.body?.token === 'string' ? req.body.token : ''
  if (token !== configuredToken) {
    res.status(401).json({ error: 'Token inválido.' })
    return
  }

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${AI_SESSION_COOKIE}=${createAiSession(configuredToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${secure}`)
  res.status(204).end()
}