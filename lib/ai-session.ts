import { createHmac, timingSafeEqual } from 'crypto'
import { AI_SESSION_COOKIE } from './ai-session-constants'

export { AI_SESSION_COOKIE }

function getSessionDigest(token: string) {
  return createHmac('sha256', token).update('telar-ai-session').digest('hex')
}

export function createAiSession(token: string) {
  return getSessionDigest(token)
}

export function hasValidAiSession(value?: string) {
  const configuredToken = process.env.AI_TOKEN
  if (!configuredToken || !value) return false

  const expected = Buffer.from(getSessionDigest(configuredToken))
  const received = Buffer.from(value)
  return expected.length === received.length && timingSafeEqual(expected, received)
}

export function canUseAiApis() {
  return process.env.NODE_ENV !== 'production' && !process.env.AI_TOKEN
}