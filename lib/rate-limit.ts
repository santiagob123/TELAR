import { randomUUID } from 'crypto'
import { isIP } from 'net'
import type { NextApiRequest } from 'next'
import prisma from './prisma'

const DEFAULTS = {
  publicIpPerMin: 10,
  publicSessionPerHour: 60,
  aiOwnerPerMin: 10,
  aiOwnerPerHour: 60,
  n8nPerMin: 120
}

let callsSinceCleanup = 0
let warnedAboutLoginFallback = false
let warnedAboutDevelopmentFallback = false
const localFallbackBuckets = new Map<string, { count: number; expiresAtMs: number }>()

function positiveIntegerEnv(name: string, fallback: number): number {
  const value = Number(process.env[name])
  return Number.isSafeInteger(value) && value > 0 ? value : fallback
}

export const RATE_LIMITS = {
  publicIpPerMin: positiveIntegerEnv('RATE_LIMIT_PUBLIC_IP_PER_MIN', DEFAULTS.publicIpPerMin),
  publicSessionPerHour: positiveIntegerEnv('RATE_LIMIT_PUBLIC_SESSION_PER_HOUR', DEFAULTS.publicSessionPerHour),
  aiOwnerPerMin: positiveIntegerEnv('RATE_LIMIT_AI_OWNER_PER_MIN', DEFAULTS.aiOwnerPerMin),
  aiOwnerPerHour: positiveIntegerEnv('RATE_LIMIT_AI_OWNER_PER_HOUR', DEFAULTS.aiOwnerPerHour),
  n8nPerMin: positiveIntegerEnv('RATE_LIMIT_N8N_PER_MIN', DEFAULTS.n8nPerMin)
}

const TRUSTED_PROXIES = new Set(
  (process.env.RATE_LIMIT_TRUSTED_PROXIES || '')
    .split(',')
    .map(normalizeIp)
    .filter((ip): ip is string => Boolean(ip))
)

export type RateLimitResult = {
  allowed: boolean
  count: number
  retryAfterSeconds: number
  expiresAt: Date
}

function normalizeIp(value: string): string | null {
  const trimmed = value.trim().replace(/^\[|\]$/g, '')
  if (isIP(trimmed) === 4) return trimmed
  if (isIP(trimmed) === 6) {
    const mappedV4 = trimmed.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i)?.[1]
    return mappedV4 && isIP(mappedV4) === 4 ? mappedV4 : trimmed.toLowerCase()
  }
  return null
}

function parseForwardedIps(header: string | string[] | undefined): string[] {
  if (typeof header !== 'string') return []
  return header.split(',').map(normalizeIp).filter((ip): ip is string => Boolean(ip))
}

export function extractClientIp(req: NextApiRequest): string {
  const remoteAddress = normalizeIp(req.socket.remoteAddress || '')
  if (!remoteAddress) return 'unknown'
  if (!TRUSTED_PROXIES.has(remoteAddress)) return remoteAddress

  const chain = [...parseForwardedIps(req.headers['x-forwarded-for']), remoteAddress]
  while (chain.length > 0 && TRUSTED_PROXIES.has(chain[chain.length - 1])) chain.pop()
  return chain[chain.length - 1] || remoteAddress
}

export async function consumeRateLimit(input: {
  key: string
  limit: number
  windowMs: number
}): Promise<RateLimitResult> {
  const { key, limit, windowMs } = input
  if (!key || !Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(windowMs) || windowMs < 1) {
    throw new Error('Invalid rate limit configuration')
  }

  const now = Date.now()
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs)
  const expiresAt = new Date(windowStart.getTime() + windowMs)
  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "RateLimitBucket" ("id", "key", "window", "count", "expiresAt")
    VALUES (${randomUUID()}, ${key}, ${windowStart}, 1, ${expiresAt})
    ON CONFLICT ("key", "window")
    DO UPDATE SET "count" = "RateLimitBucket"."count" + 1
    RETURNING "count"
  `
  const count = rows[0]?.count
  if (typeof count !== 'number') throw new Error('Rate limit counter did not return a count')

  callsSinceCleanup += 1
  if (callsSinceCleanup >= 100) {
    callsSinceCleanup = 0
    void prisma.rateLimitBucket.deleteMany({ where: { expiresAt: { lt: new Date(now) } } })
      .catch((error: unknown) => console.error('[TELAR] rate limit cleanup failed', error instanceof Error ? error.message : 'unknown error'))
    void prisma.$executeRaw`DELETE FROM "N8nIdempotency" WHERE "expiresAt" < ${new Date(now)}`
      .catch((error: unknown) => console.error('[TELAR] n8n idempotency cleanup failed', error instanceof Error ? error.message : 'unknown error'))
  }

  return {
    allowed: count <= limit,
    count,
    retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
    expiresAt
  }
}

function consumeLocalRateLimit(input: { key: string; limit: number; windowMs: number }): RateLimitResult {
  const { key, limit, windowMs } = input
  if (!key || !Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(windowMs) || windowMs < 1) {
    throw new Error('Invalid rate limit configuration')
  }

  const now = Date.now()
  let bucket = localFallbackBuckets.get(key)
  if (!bucket || bucket.expiresAtMs <= now) {
    bucket = { count: 0, expiresAtMs: now + windowMs }
    localFallbackBuckets.set(key, bucket)
  }
  bucket.count += 1

  if (localFallbackBuckets.size > 1000) {
    for (const [bucketKey, value] of localFallbackBuckets) {
      if (value.expiresAtMs <= now) localFallbackBuckets.delete(bucketKey)
    }
    if (localFallbackBuckets.size > 1000) {
      const oldestKey = localFallbackBuckets.keys().next().value
      if (oldestKey) localFallbackBuckets.delete(oldestKey)
    }
  }

  return {
    allowed: bucket.count <= limit,
    count: bucket.count,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.expiresAtMs - now) / 1000)),
    expiresAt: new Date(bucket.expiresAtMs)
  }
}

/** In development only: keep local work usable before the rate-limit migration is applied. */
export async function consumeRateLimitWithDevelopmentFallback(input: {
  key: string
  limit: number
  windowMs: number
}): Promise<RateLimitResult> {
  try {
    return await consumeRateLimit(input)
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error
    if (!warnedAboutDevelopmentFallback) {
      warnedAboutDevelopmentFallback = true
      console.warn('[TELAR] persistent rate limiter unavailable; using development-only in-memory fallback', error instanceof Error ? error.message : 'unknown error')
    }
    return consumeLocalRateLimit(input)
  }
}

/**
 * Login-specific fallback keeps account access available during DB limiter
 * migrations/outages. Other application limits remain fail-closed.
 */
export async function consumeLoginRateLimit(req: NextApiRequest): Promise<RateLimitResult> {
  const key = `login:${extractClientIp(req)}`
  try {
    return await consumeRateLimit({ key, limit: 5, windowMs: 60_000 })
  } catch (error) {
    if (!warnedAboutLoginFallback) {
      warnedAboutLoginFallback = true
      console.warn('[TELAR] persistent login rate limiter unavailable; using per-instance fallback', error instanceof Error ? error.message : 'unknown error')
    }

    return consumeLocalRateLimit({ key, limit: 5, windowMs: 60_000 })
  }
}

export function respondRateLimited(res: { setHeader(name: string, value: string): unknown; status(code: number): { json(body: unknown): unknown } }, retryAfterSeconds: number) {
  res.setHeader('Retry-After', String(retryAfterSeconds))
  return res.status(429).json({ error: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' })
}
