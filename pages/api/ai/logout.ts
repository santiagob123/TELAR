import { NextApiRequest, NextApiResponse } from 'next'
import { AI_SESSION_COOKIE } from '../../../lib/ai-session-constants'
import { requireSameOriginMutation } from '../../../lib/request-security'
import { ADMIN_SESSION_COOKIE } from '../../../lib/admin-session-constants'
import { USER_SESSION_COOKIE } from '../../../lib/user-session'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  if (!requireSameOriginMutation(req, res, { requireForAll: true })) return

  res.setHeader('Cache-Control', 'no-store, max-age=0')
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    [AI_SESSION_COOKIE, ADMIN_SESSION_COOKIE, USER_SESSION_COOKIE].map(cookie => `${cookie}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`)
  )
  res.status(204).end()
}
