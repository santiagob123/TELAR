import { NextApiRequest, NextApiResponse } from 'next'
import { getAIContext } from '../../../services/ai/context'
import { handleIncoming } from '../../../services/whatsapp'

const MAX_MESSAGE_LENGTH = 2000
const MAX_SESSION_LENGTH = 100

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text, sessionId } = req.body || {}
  if (typeof text !== 'string' || !text.trim() || text.trim().length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: 'El mensaje debe tener entre 1 y 2000 caracteres.' })
  }
  if (typeof sessionId !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(sessionId) || sessionId.length > MAX_SESSION_LENGTH) {
    return res.status(400).json({ error: 'Sesión de chat inválida.' })
  }

  try {
    const context = await getAIContext()
    const result = await handleIncoming(context.id, `public:${sessionId}`, text.trim())
    return res.status(200).json({ conversationId: result.conv.id, aiReply: result.aiReply })
  } catch (error) {
    console.error('Public chat error:', error)
    return res.status(500).json({ error: 'No se pudo procesar el mensaje.' })
  }
}