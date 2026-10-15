import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(scryptCallback)
export const USER_SESSION_COOKIE = 'telar_user_session'
const SESSION_SECONDS = 60 * 60 * 8

function sessionSecret() {
  const secret = process.env.SESSION_SECRET || ''
  return Buffer.byteLength(secret, 'utf8') >= 32 ? secret : ''
}

function sign(value: string) {
  const secret = sessionSecret()
  if (!secret) throw new Error('SESSION_SECRET no está configurado.')
  return createHmac('sha256', secret).update(value).digest('base64url')
}

export function createUserSession(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifyUserSession(value?: string) {
  if (!value || !sessionSecret()) return null
  const [payload, signature, extra] = value.split('.')
  if (!payload || !signature || extra) return null
  try {
    const expected = Buffer.from(sign(payload))
    const received = Buffer.from(signature)
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { userId?: unknown; exp?: unknown }
    if (typeof data.userId !== 'string' || typeof data.exp !== 'number' || data.exp <= Date.now() / 1000) return null
    return { userId: data.userId }
  } catch {
    return null
  }
}

export async function hashPassword(password: string) {
  if (password.length < 12 || password.length > 200) throw new Error('La contraseña debe tener entre 12 y 200 caracteres.')
  const salt = randomBytes(16)
  const derived = await scrypt(password, salt, 64) as Buffer
  return `scrypt$${salt.toString('base64url')}$${derived.toString('base64url')}`
}

export async function verifyPassword(password: string, stored: string | null) {
  if (!stored || password.length > 200) return false
  const [algorithm, saltText, hashText, extra] = stored.split('$')
  if (algorithm !== 'scrypt' || !saltText || !hashText || extra) return false
  try {
    const expected = Buffer.from(hashText, 'base64url')
    const actual = await scrypt(password, Buffer.from(saltText, 'base64url'), expected.length) as Buffer
    return expected.length === actual.length && timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}

export function userSessionCookie(value: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${USER_SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}${secure}`
}
