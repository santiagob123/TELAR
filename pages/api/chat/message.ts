import { NextApiRequest, NextApiResponse } from 'next'
import { getPublicAIContext } from '../../../services/ai/context'
import { handleIncoming } from '../../../services/ai/conversation'
import { consumeRateLimitWithDevelopmentFallback, extractClientIp, RATE_LIMITS, respondRateLimited } from '../../../lib/rate-limit'

const MAX_MESSAGE_LENGTH = 2000
const MAX_SESSION_LENGTH = 100

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, sessionId } = req.body || {}

  if (typeof text !== 'string' || !text.trim() || text.trim().length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: 'El mensaje debe tener entre 1 y 2000 caracteres.' })
  }

  if (typeof sessionId !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(sessionId) || sessionId.length > MAX_SESSION_LENGTH) {
    return res.status(400).json({ error: 'Sesión de chat inválida.' })
  }
  const wantsStream = req.headers.accept?.includes('text/event-stream') === true
  const sendEvent = (payload: unknown) => {
    if (!res.destroyed && !res.writableEnded) res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  try {
    const clientIp = extractClientIp(req)
    const ipLimit = await consumeRateLimitWithDevelopmentFallback({
      key: `public:ip:${clientIp}:minute`,
      limit: RATE_LIMITS.publicIpPerMin,
      windowMs: 60_000
    })
    if (!ipLimit.allowed) return respondRateLimited(res, ipLimit.retryAfterSeconds)

    const sessionLimit = await consumeRateLimitWithDevelopmentFallback({
      key: `public:session:${sessionId}:hour`,
      limit: RATE_LIMITS.publicSessionPerHour,
      windowMs: 3_600_000
    })
    if (!sessionLimit.allowed) return respondRateLimited(res, sessionLimit.retryAfterSeconds)
  } catch (error) {
    console.error('Public chat rate limit error:', error instanceof Error ? error.message : 'Error desconocido')
    return res.status(503).json({ error: 'El servicio no está disponible temporalmente.' })
  }

  try {
    const context = await getPublicAIContext()
    console.info('[TELAR AI] public_chat', {
      businessId: context.id,
      businessName: context.name,
      sessionIdLength: sessionId.length,
      messageChars: text.trim().length
    })
    if (wantsStream) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache, no-transform')
      res.setHeader('Connection', 'keep-alive')
      res.setHeader('X-Accel-Buffering', 'no')
      res.flushHeaders()
    }

    const result = await handleIncoming(
      context.id,
      `public:${sessionId}`,
      text.trim(),
      undefined,
      wantsStream ? chunk => sendEvent({ type: 'token', text: chunk }) : undefined,
      'SAPO'
    )
    if (wantsStream) {
      sendEvent({
        type: 'done',
        conversationId: result.conv.id,
        handedOff: result.handedOff,
        aiReply: result.aiReply
      })
      return res.end()
    }

    return res.status(200).json({
      conversationId: result.conv.id,
      aiReply: result.handedOff ? null : result.aiReply,
      handedOff: result.handedOff
    })
  } catch (error) {
    // Registro interno seguro: nunca exponer stack traces ni credenciales al cliente
    console.error('Public chat error:', error instanceof Error ? error.message : 'Error desconocido')
    if (wantsStream && res.headersSent) {
      sendEvent({ type: 'error', error: 'No se pudo procesar el mensaje.' })
      return res.end()
    }
    return res.status(500).json({ error: 'No se pudo procesar el mensaje.' })
  }
}
