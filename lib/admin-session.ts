import { createHmac, timingSafeEqual } from 'crypto'
import { ADMIN_SESSION_COOKIE } from './admin-session-constants'

export { ADMIN_SESSION_COOKIE }

function getSessionDigest(token: string) {
  return createHmac('sha256', token).update('telar-admin-session').digest('hex')
}

export function createAdminSession(token: string) {
  return getSessionDigest(token)
}

export function hasValidAdminSession(value?: string) {
  const configuredToken = process.env.ADMIN_TOKEN
  if (!configuredToken || !value) return false

  const expected = Buffer.from(getSessionDigest(configuredToken))
  const received = Buffer.from(value)
  return expected.length === received.length && timingSafeEqual(expected, received)
}

export function canUseAdminApis() {
  return process.env.NODE_ENV !== 'production' && !process.env.ADMIN_TOKEN
}