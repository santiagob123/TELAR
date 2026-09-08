import { PrismaClient } from '@prisma/client'
import { getAIContext } from '../services/ai/context'
import { ensureTelarAIKnowledge } from '../services/ai/knowledge'

const prisma = new PrismaClient()

async function ensureDemoTagData() {
  let demoBusiness = await prisma.business.findFirst({
    where: { name: 'Demo Negocio' },
    include: { profile: true }
  })

  if (!demoBusiness) {
    demoBusiness = await prisma.business.create({
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
      include: { profile: true }
    })
  }

  if (!demoBusiness.profile) {
    demoBusiness = await prisma.business.update({
      where: { id: demoBusiness.id },
      data: {
        profile: {
          create: {
            title: 'Demo Perfil',
            description: 'Perfil de demostración',
            imageUrl: ''
          }
        }
      },
      include: { profile: true }
    })
  }

  const tag = await prisma.tag.findUnique({ where: { identifier: 'demo123' } })
  if (!tag && demoBusiness.profile) {
    await prisma.tag.create({
      data: { identifier: 'demo123', profileId: demoBusiness.profile.id }
    })
  }

  console.log('✓ TAG demo data ensured:', demoBusiness.name)
}

async function main() {
  try {
    await ensureDemoTagData()
    const aiContext = await getAIContext()
    const knowledge = await ensureTelarAIKnowledge(aiContext.id)
    console.log('✓ TELAR AI context:', aiContext.name, '(ID:', aiContext.id + ')')
    console.log('✓ TELAR AI Knowledge Base items:', knowledge.length)

    console.log('\n🎉 Seed completed successfully!')
    console.log('TELAR AI knowledge loaded idempotently')
  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  }
}

main()
  .catch(e => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
