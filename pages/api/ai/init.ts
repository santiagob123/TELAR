import { NextApiRequest, NextApiResponse } from 'next'
import { requireAiToken } from '../../../lib/ai-auth'
import { getAIContext } from '../../../services/ai/context'

/**
 * Initializes demo business if it doesn't exist
 * This is a fallback in case the seed didn't run properly
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAiToken(req, res)) return
  try {
    const business = await getAIContext()

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
