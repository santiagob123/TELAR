import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { assertValidBusinessInput } from '../../../services/tag'
import { requireAdminToken } from '../../../lib/admin-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method === 'PATCH') {
    if (!requireAdminToken(req, res)) return
    const {
      title,
      description,
      contactPhone,
      whatsapp,
      email,
      address,
      openingHours,
      website,
      instagram,
      facebook,
      linkedin
    } = req.body

    try {
      const existing = await prisma.digitalProfile.findUnique({
        where: { id: String(id) },
        include: { business: true }
      })
      if (!existing) return res.status(404).json({ error: 'Not found' })

      assertValidBusinessInput({
        name: existing.business.name,
        description,
        contactPhone,
        whatsapp,
        email,
        website,
        instagram,
        facebook,
        linkedin
      })

      const updated = await prisma.$transaction(async (transaction) => {
        const profile = await transaction.digitalProfile.update({
          where: { id: String(id) },
          data: {
            title: String(title || '').trim(),
            description: String(description || '').trim()
          }
        })

        await transaction.business.update({
          where: { id: profile.businessId },
          data: {
            contactPhone: String(contactPhone || '').trim(),
            whatsapp: String(whatsapp || '').trim(),
            email: email ? String(email).trim() : null,
            address: address ? String(address).trim() : null,
            openingHours: openingHours ? String(openingHours).trim() : null,
            website: website ? String(website).trim() : null,
            instagram: instagram ? String(instagram).trim() : null,
            facebook: facebook ? String(facebook).trim() : null,
            linkedin: linkedin ? String(linkedin).trim() : null
          }
        })

        return transaction.digitalProfile.findUnique({
          where: { id: String(id) },
          include: { business: true, tags: true }
        })
      })
      return res.json(updated)
    } catch (e:any) {
      if (e?.code === 'VALIDATION_ERROR') return res.status(400).json({ error: e.message })
      if (e?.code === 'P2025') return res.status(404).json({ error: 'Not found' })
      return res.status(500).json({ error: 'Error interno del servidor.' })
    }
  }
  res.status(405).end()
}
