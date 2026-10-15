import { NextApiRequest, NextApiResponse } from 'next'
import { handleIncoming } from '../../../services/ai/conversation'
import { requireAiUser } from '../../../lib/ai-auth'
import { getAIContext } from '../../../services/ai/context'
import { consumeRateLimitWithDevelopmentFallback, RATE_LIMITS, respondRateLimited } from '../../../lib/rate-limit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const ownerId = await requireAiUser(req, res)
  if (!ownerId) return

  const { from, text } = req.body || {}

  if (
    typeof from !== 'string' || !from.trim() ||
    typeof text !== 'string' || !text.trim()
  ) {
    return res.status(400).json({ error: 'Campos requeridos: from y text válidos.' })
  }

  try {
    const minuteLimit = await consumeRateLimitWithDevelopmentFallback({
      key: `ai:owner:${ownerId}:minute`,
      limit: RATE_LIMITS.aiOwnerPerMin,
      windowMs: 60_000
    })
    if (!minuteLimit.allowed) return respondRateLimited(res, minuteLimit.retryAfterSeconds)

    const hourLimit = await consumeRateLimitWithDevelopmentFallback({
      key: `ai:owner:${ownerId}:hour`,
      limit: RATE_LIMITS.aiOwnerPerHour,
      windowMs: 3_600_000
    })
    if (!hourLimit.allowed) return respondRateLimited(res, hourLimit.retryAfterSeconds)
  } catch (error) {
    console.error('AI message rate limit error:', error instanceof Error ? error.message : 'Error desconocido')
    return res.status(503).json({ error: 'El servicio no está disponible temporalmente.' })
  }

  try {
    const business = await getAIContext(ownerId)
    const out = await handleIncoming(business.id, from.trim(), text.trim())
    return res.json(out)
  } catch (error) {
    console.error('AI message API error:', error instanceof Error ? error.message : 'Error desconocido')
    return res.status(500).json({ error: 'No se pudo procesar el mensaje.' })
  }
}
