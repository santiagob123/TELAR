import prisma from '../../lib/prisma'
import { ensureTelarAIKnowledge, TELAR_AI_KNOWLEDGE } from './knowledge'

const AI_CONTEXT_NAME = 'TELAR AI'
const AI_CONTEXT_DESCRIPTION = 'Contexto técnico y productivo del MVP TELAR AI'

function getKnowledgeSyncState(knowledge: Array<{ title: string; content: string }>) {
  const official = new Map(TELAR_AI_KNOWLEDGE.map(item => [item.title, item.content]))
  const existing = new Map(knowledge.map(item => [item.title, item.content]))

  let missing = false
  let stale = false

  for (const [title, content] of official.entries()) {
    const current = existing.get(title)
    if (!current) {
      missing = true
      continue
    }
    if (current !== content) {
      stale = true
    }
  }

  return { missing, stale }
}

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
    const syncState = getKnowledgeSyncState(existing.knowledge)

    if (syncState.missing || syncState.stale) {
      const refreshedKnowledge = await ensureTelarAIKnowledge(existing.id)
      console.info('[TELAR AI] context_syncing', {
        businessId: existing.id,
        businessName: existing.name,
        missing: syncState.missing,
        stale: syncState.stale,
        previousKbCount: existing.knowledge.length,
        nextKbCount: refreshedKnowledge.length,
        kbContentChars: kbChars
      })
      return { ...existing, knowledge: refreshedKnowledge }
    }

    console.info('[TELAR AI] context_ok', {
      businessId: existing.id,
      businessName: existing.name,
      kbExists: existing.knowledge.length > 0,
      kbCount: existing.knowledge.length,
      kbContentChars: kbChars,
      synced: false
    })

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
    kbCount: knowledge.length,
    synced: true
  })
  return { ...created, knowledge }
}