import { createHmac, timingSafeEqual } from 'crypto'
import { AI_SESSION_COOKIE } from './ai-session-constants'

export { AI_SESSION_COOKIE }

const SESSION_SECONDS = 60 * 60 * 8

function getSessionDigest(token: string, expiresAt: number) {
  return createHmac('sha256', token).update(`telar-ai-session:${expiresAt}`).digest('hex')
}

export function createAiSession(token: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS
  return `${expiresAt}.${getSessionDigest(token, expiresAt)}`
}

export function hasValidAiSession(value?: string) {
  const configuredToken = process.env.AI_TOKEN
  if (!configuredToken || !value) return false

  const [expiresText, signature, extra] = value.split('.')
  const expiresAt = Number(expiresText)
  if (extra || !Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() / 1000 || !signature) return false

  const expected = Buffer.from(getSessionDigest(configuredToken, expiresAt))
  const received = Buffer.from(signature)
  return expected.length === received.length && timingSafeEqual(expected, received)
}

export function canUseAiApis() {
  return process.env.NODE_ENV !== 'production' && !process.env.AI_TOKEN
}
