import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ status: 'method_not_allowed' })
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    return res.status(200).json({ status: 'ok' })
  } catch {
    return res.status(503).json({ status: 'unavailable' })
  }
}
