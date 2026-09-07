import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

/**
 * Initializes demo business if it doesn't exist
 * This is a fallback in case the seed didn't run properly
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check if business already exists
    let business = await prisma.business.findFirst({
      where: { name: 'Demo Negocio' },
      include: { profile: true, knowledge: true }
    })

    // If exists, return it
    if (business) {
      return res.json({
        success: true,
        message: 'Business already exists',
        businessId: business.id
      })
    }

    // Create new business
    business = await prisma.business.create({
      data: {
        name: 'Demo Negocio',
        description: 'Negocio demo para TELAR',
        contactPhone: '+34123456789',
        whatsapp: '+34123456789',
        profile: {
          create: {
            title: 'Demo Perfil',
            description: 'Perfil de demostración',
            imageUrl: ''
          }
        },
        knowledge: {
          create: [
            { title: 'Horario', content: 'Lun-Vie 9-18' },
            { title: 'Contacto', content: 'contacto@example.com' }
          ]
        }
      },
      include: { profile: true, knowledge: true }
    })

    // Create tag
    if (business.profile) {
      await prisma.tag.create({
        data: {
          identifier: 'demo123',
          profileId: business.profile.id
        }
      })
    }

    return res.json({
      success: true,
      message: 'Business initialized',
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
