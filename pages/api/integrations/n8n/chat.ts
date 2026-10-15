import { NextApiRequest, NextApiResponse } from 'next'
import { createHash, randomUUID } from 'crypto'
import { getAIContext } from '../../../../services/ai/context'
import { handleIncoming } from '../../../../services/ai/conversation'
import { consumeRateLimit, RATE_LIMITS, respondRateLimited } from '../../../../lib/rate-limit'
import prisma from '../../../../lib/prisma'

const MAX_MESSAGE_LENGTH = 2000
const MAX_SESSION_LENGTH = 100

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const configuredSecret = process.env.N8N_WEBHOOK_SECRET
  const receivedSecret = req.headers['x-n8n-secret']
  if (!configuredSecret || typeof receivedSecret !== 'string' || receivedSecret !== configuredSecret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { text, sessionId } = req.body || {}

  if (typeof text !== 'string' || !text.trim() || text.trim().length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: 'El mensaje debe tener entre 1 y 2000 caracteres.' })
  }

  if (typeof sessionId !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(sessionId) || sessionId.length > MAX_SESSION_LENGTH) {
    return res.status(400).json({ error: 'Sesión de chat inválida.' })
  }

  const headerKey = req.headers['idempotency-key']
  if (headerKey !== undefined && (typeof headerKey !== 'string' || !/^[A-Za-z0-9._:-]{1,200}$/.test(headerKey))) {
    return res.status(400).json({ error: 'Idempotency-Key inválida.' })
  }

  try {
    const rateLimit = await consumeRateLimit({
      key: 'n8n:minute',
      limit: RATE_LIMITS.n8nPerMin,
      windowMs: 60_000
    })
    if (!rateLimit.allowed) return respondRateLimited(res, rateLimit.retryAfterSeconds)
  } catch (error) {
    console.error('n8n chat rate limit error:', error instanceof Error ? error.message : 'Error desconocido')
    return res.status(503).json({ error: 'El servicio no está disponible temporalmente.' })
  }

  let reservedKey: string | undefined
  try {
    if (typeof headerKey === 'string') {
      const payloadHash = createHash('sha256').update(`${sessionId}\u0000${text.trim()}`).digest('hex')
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const inserted = await prisma.$queryRaw<Array<{ id: string }>>`
        INSERT INTO "N8nIdempotency" ("id", "key", "payloadHash", "status", "expiresAt")
        VALUES (${randomUUID()}, ${headerKey}, ${payloadHash}, 'pending', ${expiresAt})
        ON CONFLICT ("key") DO NOTHING
        RETURNING "id"
      `

      if (inserted.length > 0) {
        reservedKey = headerKey
      } else {
        const existing = await prisma.$queryRaw<Array<{ payloadHash: string; status: string; response: unknown; expiresAt: Date }>>`
          SELECT "payloadHash", "status", "response", "expiresAt"
          FROM "N8nIdempotency" WHERE "key" = ${headerKey}
        `
        const prior = existing[0]
        if (!prior) return res.status(503).json({ error: 'No se pudo reservar la solicitud.' })
        if (prior.payloadHash !== payloadHash) {
          return res.status(409).json({ error: 'Idempotency-Key ya fue usada con otro contenido.' })
        }
        if (prior.status === 'completed' && prior.response) return res.status(200).json(prior.response)
        if (prior.status === 'pending' && prior.expiresAt.getTime() > Date.now()) {
          res.setHeader('Retry-After', '3')
          return res.status(409).json({ error: 'La solicitud con esta clave aún está en proceso.' })
        }

        const reclaimed = await prisma.$queryRaw<Array<{ id: string }>>`
          UPDATE "N8nIdempotency"
          SET "status" = 'pending', "response" = NULL, "expiresAt" = ${expiresAt}
          WHERE "key" = ${headerKey}
            AND ("status" = 'failed' OR "expiresAt" <= NOW())
          RETURNING "id"
        `
        if (reclaimed.length === 0) {
          res.setHeader('Retry-After', '3')
          return res.status(409).json({ error: 'La solicitud con esta clave aún está en proceso.' })
        }
        reservedKey = headerKey
      }
    }

    const context = await getAIContext()
    console.info('[TELAR AI] n8n_chat', {
      businessId: context.id,
      businessName: context.name,
      sessionIdLength: sessionId.length,
      messageChars: text.trim().length
    })

    const result = await handleIncoming(
      context.id,
      `n8n:${sessionId}`,
      text.trim(),
      reservedKey ? `n8n:${sessionId}:${reservedKey}` : undefined
    )
    const responseBody = {
      conversationId: result.conv.id,
      aiReply: result.handedOff ? null : result.aiReply,
      handedOff: result.handedOff
    }
    if (reservedKey) {
      await prisma.$executeRaw`
        UPDATE "N8nIdempotency"
        SET "status" = 'completed', "response" = ${JSON.stringify(responseBody)}::jsonb
        WHERE "key" = ${reservedKey}
      `
    }
    return res.status(200).json(responseBody)
  } catch (error) {
    console.error('n8n chat error:', error instanceof Error ? error.message : 'Error desconocido')
    if (reservedKey) {
      try {
        await prisma.$executeRaw`UPDATE "N8nIdempotency" SET "status" = 'failed' WHERE "key" = ${reservedKey}`
      } catch {
        // The reservation can be reclaimed after expiry if the database is unavailable.
      }
    }
    return res.status(500).json({ error: 'No se pudo procesar el mensaje.' })
  }
}
