import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { assertValidBusinessInput, getOwnedProfile } from '../../../services/tag'
import { requireAdminAccess } from '../../../lib/admin-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method === 'PATCH') {
    const access = await requireAdminAccess(req, res)
    if (!access) return
    const {
      businessName,
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
      linkedin,
      imageUrl
    } = req.body

    try {
      const existing = await getOwnedProfile(String(id), access.isGlobalAdmin ? undefined : access.ownerId)
      if (!existing) return res.status(404).json({ error: 'Not found' })

      assertValidBusinessInput({
        name: businessName,
        description,
        contactPhone,
        whatsapp,
        email,
        website,
        instagram,
        facebook,
        linkedin
      })

      const normalizedImageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : ''
      if (normalizedImageUrl) {
        let parsedImageUrl: URL
        try {
          parsedImageUrl = new URL(normalizedImageUrl)
        } catch {
          return res.status(400).json({ error: 'La imagen debe usar una URL válida.' })
        }
        if (!['http:', 'https:'].includes(parsedImageUrl.protocol) || normalizedImageUrl.length > 2048) {
          return res.status(400).json({ error: 'La imagen debe usar una URL HTTP o HTTPS de hasta 2048 caracteres.' })
        }
      }

      const updated = await prisma.$transaction(async (transaction) => {
        const profile = await transaction.digitalProfile.update({
          where: { id: String(id) },
          data: {
            title: String(title || '').trim(),
            description: String(description || '').trim(),
            imageUrl: normalizedImageUrl || null
          }
        })

        await transaction.business.update({
          where: { id: profile.businessId },
          data: {
            name: String(businessName || '').trim(),
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
