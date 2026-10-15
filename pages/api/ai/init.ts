import { NextApiRequest, NextApiResponse } from 'next'
import { requireAiUser } from '../../../lib/ai-auth'
import { ensureAIContext } from '../../../services/ai/context'

/**
 * Initializes demo business if it doesn't exist
 * This is a fallback in case the seed didn't run properly
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ownerId = await requireAiUser(req, res)
  if (!ownerId) return
  try {
    const business = await ensureAIContext(ownerId)

    return res.json({
      success: true,
      message: 'AI context initialized',
      businessId: business.id
    })
  } catch (error: any) {
    console.error('Init error:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
