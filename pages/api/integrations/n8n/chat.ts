import { NextApiRequest, NextApiResponse } from 'next'
import { getAIContext } from '../../../../services/ai/context'
import { handleIncoming } from '../../../../services/ai/conversation'

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

  try {
    const context = await getAIContext()
    console.info('[TELAR AI] n8n_chat', {
      businessId: context.id,
      businessName: context.name,
      sessionIdLength: sessionId.length,
      messageChars: text.trim().length
    })

    // Los reintentos de n8n pueden persistir mensajes duplicados; una idempotency key queda pendiente.
    const result = await handleIncoming(context.id, `n8n:${sessionId}`, text.trim())
    return res.status(200).json({ conversationId: result.conv.id, aiReply: result.aiReply })
  } catch (error) {
    console.error('n8n chat error:', error instanceof Error ? error.message : 'Error desconocido')
    return res.status(500).json({ error: 'No se pudo procesar el mensaje.' })
  }
}
