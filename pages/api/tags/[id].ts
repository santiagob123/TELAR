import { NextApiRequest, NextApiResponse } from 'next'
import { setTagStatusByIdentifier } from '../../../services/tag'
import { requireAdminAccess } from '../../../lib/admin-auth'
import { getPublicTagByIdentifier } from '../../../lib/public-tag'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    const tag = await getPublicTagByIdentifier(String(id))
    if (!tag) return res.status(404).json({ error: 'Not found' })
    if (tag.status === 'inactive') {
      return res.json({ identifier: tag.identifier, status: tag.status })
    }
    return res.json(tag)
  }

  if (req.method === 'PATCH') {
    const access = await requireAdminAccess(req, res)
    if (!access) return
    const { status } = req.body
    try {
      const updated = await setTagStatusByIdentifier(String(id), status, access.isGlobalAdmin ? undefined : access.ownerId)
      if (!updated) return res.status(404).json({ error: 'Not found' })
      return res.json(updated)
    } catch (error: any) {
      if (error?.code === 'P2025') return res.status(404).json({ error: 'Not found' })
      if (error?.code === 'VALIDATION_ERROR') return res.status(400).json({ error: error.message })
      return res.status(500).json({ error: 'Error interno del servidor.' })
    }
  }

  res.status(405).end()
}
