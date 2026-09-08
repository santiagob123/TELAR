import prisma from '../../lib/prisma'
import { ensureTelarAIKnowledge } from './knowledge'

const AI_CONTEXT_NAME = 'TELAR AI'
const AI_CONTEXT_DESCRIPTION = 'Contexto independiente del MVP TELAR AI'

export async function getAIContext() {
  // El contexto de TELAR AI no tiene DigitalProfile (eso es TELAR TAG).
  // Evita reutilizar un negocio TAG que coincida solo por el nombre.
  const existing = await prisma.business.findFirst({
    where: {
      name: AI_CONTEXT_NAME,
      profile: { is: null }
    },
    include: { knowledge: true }
  })
  if (existing) {
    const kbChars = existing.knowledge.reduce((sum, item) => sum + item.title.length + item.content.length, 0)
    console.info('[TELAR AI] context', {
      businessId: existing.id,
      businessName: existing.name,
      kbExists: existing.knowledge.length > 0,
      kbCount: existing.knowledge.length,
      kbContentChars: kbChars
    })
    if (existing.knowledge.length === 0) {
      console.warn('[TELAR AI] context_empty_kb', {
        businessId: existing.id,
        hint: 'Ejecuta npm run seed para cargar el conocimiento inicial de TELAR AI.'
      })
    }
    return existing
  }

  const created = await prisma.business.create({
    data: {
      name: AI_CONTEXT_NAME,
      description: AI_CONTEXT_DESCRIPTION,
    },
  })

  const knowledge = await ensureTelarAIKnowledge(created.id)

  console.info('[TELAR AI] context_created', {
    businessId: created.id,
    businessName: created.name,
    kbCount: knowledge.length
  })
  return { ...created, knowledge }
}