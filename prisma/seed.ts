import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Clean up old data
    await prisma.message.deleteMany({})
    await prisma.conversation.deleteMany({})
    await prisma.tag.deleteMany({})
    await prisma.knowledgeBase.deleteMany({})
    await prisma.digitalProfile.deleteMany({})
    await prisma.business.deleteMany({})
    
    console.log('✓ Cleaned up old data')

    // Create business with all relations
    const b = await prisma.business.create({
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
    
    console.log('✓ Business created:', b.name, '(ID:', b.id + ')')
    console.log('✓ Profile created:', b.profile?.id)
    console.log('✓ Knowledge Base items:', b.knowledge.length)

    // Create tag
    await prisma.tag.create({ 
      data: { 
        identifier: 'demo123', 
        profileId: b.profile!.id 
      } 
    })
    
    console.log('✓ Tag created: demo123')
    console.log('\n🎉 Seed completed successfully!')
    console.log('Business ID:', b.id)
    console.log('Ready to use TELAR AI')
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
