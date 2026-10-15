import { NextApiRequest, NextApiResponse } from 'next'
import { AI_SESSION_COOKIE, createAiSession } from '../../../lib/ai-session'
import prisma from '../../../lib/prisma'
import { createUserSession, userSessionCookie, verifyPassword } from '../../../lib/user-session'
import { consumeLoginRateLimit, respondRateLimited } from '../../../lib/rate-limit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  try {
    const limited = await consumeLoginRateLimit(req)
    if (!limited.allowed) return respondRateLimited(res, limited.retryAfterSeconds)
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body?.password === 'string' ? req.body.password : ''
    if (email && password) {
      if (!process.env.SESSION_SECRET) return res.status(503).json({ error: 'El inicio de sesión por usuario no está configurado.' })
      const user = await prisma.user.findUnique({ where: { email }, select: { id: true, password: true } })
      if (!user || !await verifyPassword(password, user.password)) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' })
      res.setHeader('Set-Cookie', userSessionCookie(createUserSession(user.id)))
      return res.status(204).end()
    }
    const configuredToken = process.env.AI_TOKEN
    if (!configuredToken) return res.status(503).json({ error: 'TELAR AI no está configurado.' })
    const token = typeof req.body?.token === 'string' ? req.body.token : ''
    if (token !== configuredToken) return res.status(401).json({ error: 'Credenciales incorrectas.' })

    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    res.setHeader('Set-Cookie', `${AI_SESSION_COOKIE}=${createAiSession(configuredToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${secure}`)
    res.status(204).end()
  } catch (error) {
    console.error('[TELAR] AI login failed', error instanceof Error ? error.message : 'unknown error')
    res.status(503).json({ error: 'No fue posible iniciar sesión temporalmente.' })
  }
}
