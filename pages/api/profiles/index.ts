import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { requireAdminToken } from '../../../lib/admin-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (!requireAdminToken(req, res)) return
    const profiles = await prisma.digitalProfile.findMany({ include: { business: true, tags: true } })
    return res.json(profiles)
  }
  res.status(405).end()
}
