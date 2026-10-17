import type { NextApiRequest, NextApiResponse } from 'next'

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const SESSION_COOKIES = ['telar_user_session', 'telar_admin_session', 'telar_ai_session'] as const

function requestOrigin(req: NextApiRequest): string | null {
  const originHeader = req.headers.origin
  const refererHeader = req.headers.referer
  const raw = typeof originHeader === 'string' ? originHeader : typeof refererHeader === 'string' ? refererHeader : ''

  if (raw) {
    try {
      return new URL(raw).origin
    } catch {
      return null
    }
  }

  return req.headers['sec-fetch-site'] === 'same-origin' ? 'same-origin' : null
}

/** Reject cross-origin state changes that rely on browser cookies. */
export function requireSameOriginMutation(
  req: NextApiRequest,
  res: NextApiResponse,
  options: { requireForAll?: boolean } = {}
) {
  if (!UNSAFE_METHODS.has(req.method || '')) return true

  const hasSessionCookie = SESSION_COOKIES.some(cookie => Boolean(req.cookies[cookie]))
  if (!options.requireForAll && !hasSessionCookie) return true

  const origin = requestOrigin(req)
  if (origin === 'same-origin') return true

  const hostHeader = req.headers.host
  const forwardedProtocol = req.headers['x-forwarded-proto']
  const protocol = typeof forwardedProtocol === 'string'
    ? forwardedProtocol.split(',')[0].trim()
    : process.env.NODE_ENV === 'production' ? 'https' : 'http'

  if (origin && hostHeader && (protocol === 'http' || protocol === 'https')) {
    try {
      const expectedOrigin = new URL(`${protocol}://${hostHeader}`).origin
      if (origin === expectedOrigin) return true
    } catch {
      // Invalid host/protocol must fail closed.
    }
  }

  res.status(403).json({ error: 'Solicitud de origen no permitido.' })
  return false
}
