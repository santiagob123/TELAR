import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const CONTEXT_NAME = 'TELAR AI'

function hasFlag(name: string) {
  return process.argv.slice(2).includes(`--${name}`)
}

async function main() {
  const apply = hasFlag('apply')
  const aiUserId = process.env.AI_USER_ID?.trim() || ''

  if (!aiUserId) {
    throw new Error('AI_USER_ID no está configurado.')
  }

  const user = await prisma.user.findUnique({
    where: { id: aiUserId },
    select: { id: true }
  })

  if (!user) {
    throw new Error('AI_USER_ID no corresponde a un usuario existente.')
  }

  const context = await prisma.business.findFirst({
    where: {
      name: CONTEXT_NAME,
      profile: { is: null }
    },
    select: { id: true, ownerId: true }
  })

  if (!context) {
    throw new Error('No existe un negocio técnico TELAR AI sin DigitalProfile.')
  }

  if (context.ownerId && context.ownerId !== user.id) {
    throw new Error('El contexto TELAR AI ya pertenece a otro propietario.')
  }

  if (context.ownerId === user.id) {
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'review', status: 'already_assigned' }))
    return
  }

  if (!apply) {
    console.log(JSON.stringify({ mode: 'review', status: 'ready_to_assign' }))
    return
  }

  const result = await prisma.business.updateMany({
    where: { id: context.id, ownerId: null },
    data: { ownerId: user.id }
  })

  if (result.count !== 1) {
    throw new Error('El contexto TELAR AI cambió antes de la asignación; no se modificó ningún propietario.')
  }

  console.log(JSON.stringify({ mode: 'apply', status: 'assigned' }))
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : 'No se pudo preparar la asignación.')
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })