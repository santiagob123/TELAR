import { NextApiRequest, NextApiResponse } from 'next'
import { getBusinessesWithProfiles } from '../../../services/tag'
import { requireAdminAccess } from '../../../lib/admin-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const access = await requireAdminAccess(req, res)
    if (!access) return
    const businesses = await getBusinessesWithProfiles(access.isGlobalAdmin ? undefined : access.ownerId)
    return res.json(businesses)
  }
  res.status(405).end()
}
