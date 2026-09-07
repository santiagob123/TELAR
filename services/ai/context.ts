import prisma from '../../lib/prisma'

const AI_CONTEXT_NAME = 'TELAR AI'

export async function getAIContext() {
  const existing = await prisma.business.findFirst({
    where: { name: AI_CONTEXT_NAME },
    include: { knowledge: true }
  })
  if (existing) return existing

  return prisma.business.create({
    data: {
      name: AI_CONTEXT_NAME,
      description: 'Contexto independiente del MVP TELAR AI',
      knowledge: {
        create: [
          { title: 'Qué es TELAR AI', content: 'TELAR AI es el asistente virtual independiente de TELAR.' },
          { title: 'Ayuda', content: 'Puedes escribir una pregunta para probar el asistente.' }
        ]
      }
    }
  })
}