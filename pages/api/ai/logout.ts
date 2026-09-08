import { NextApiRequest, NextApiResponse } from 'next'
import { AI_SESSION_COOKIE } from '../../../lib/ai-session-constants'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  // Invalida la sesión de TELAR AI eliminando su cookie.
  // No toca telar_admin_session ni ninguna otra cookie de TAG.
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${AI_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  )
  res.status(204).end()
}
