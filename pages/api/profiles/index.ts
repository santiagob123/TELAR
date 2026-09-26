import { NextApiRequest, NextApiResponse } from 'next'
import { getProfilesByOwner } from '../../../services/tag'
import { requireAdminUser } from '../../../lib/admin-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const ownerId = await requireAdminUser(req, res)
    if (!ownerId) return
    const profiles = await getProfilesByOwner(ownerId)
    return res.json(profiles)
  }
  res.status(405).end()
}
