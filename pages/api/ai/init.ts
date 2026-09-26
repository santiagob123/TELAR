import { NextApiRequest, NextApiResponse } from 'next'
import { requireAiUser } from '../../../lib/ai-auth'
import { getAIContext } from '../../../services/ai/context'

/**
 * Initializes demo business if it doesn't exist
 * This is a fallback in case the seed didn't run properly
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ownerId = await requireAiUser(req, res)
  if (!ownerId) return
  try {
    const business = await getAIContext(ownerId)

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
