import prisma from '../../lib/prisma'
import { randomUUID } from 'crypto'

export const TELAR_AI_KNOWLEDGE = [
  {
    title: 'Qué es TELAR',
    content:
      'TELAR es una iniciativa con dos MVP principales: TELAR TAG y TELAR AI. TELAR AI es el asistente virtual de TELAR orientado a conversaciones y atención.'
  },
  {
    title: 'TELAR TAG',
    content:
      'TELAR TAG es el MVP de gestión de perfiles digitales de negocios y tags identificados por un identificador público. Incluye perfiles digitales, tags, generación de códigos QR y páginas públicas de tag. El estado de un tag puede ser active o inactive.'
  },
  {
    title: 'TELAR AI',
    content:
      'TELAR AI es el asistente virtual independiente de TELAR. El proyecto incluye un canal web público mediante el ChatBubble en la interfaz principal, un entorno interno en /ai, conversaciones con historial y una base de conocimiento asociada al negocio técnico de TELAR AI.'
  },
  {
    title: 'Capacidades actuales de TELAR AI',
    content:
      'TELAR AI puede atender conversaciones en el chat público y en el entorno interno del proyecto. Actualmente se cuenta con historial de conversaciones, base de conocimiento y un proveedor de IA configurable. El agente está orientado a responder preguntas sobre TELAR, TELAR TAG y TELAR AI según la información disponible en el proyecto.'
  },
  {
    title: 'Canales de TELAR AI',
    content:
      'El canal web público mediante el ChatBubble está implementado. También existe una integración de automatización y prueba con n8n y una prueba de integración con Gmail. La integración real de WhatsApp aún está pendiente y no debe asumirse como implementada. Otros canales no están confirmados como disponibles actualmente.'
  },
  {
    title: 'Estado actual y limitaciones',
    content:
      'TELAR AI debe responder únicamente con información confirmada por el proyecto. Si la información no está disponible, debe reconocerlo y recomendar contactar con el equipo. No debe inventar precios, clientes, horarios, datos de contacto, integraciones ni funcionalidades no confirmadas. El estado de WhatsApp sigue pendiente y el proyecto no confirma capacidades adicionales fuera de las implementadas.'
  },
  {
    title: 'Información no confirmada',
    content:
      'Si una pregunta requiere información comercial, de precios, de clientes, de horarios, de contacto, de integraciones no implementadas o de canales no confirmados, TELAR AI debe indicar que esa información no está confirmada en el proyecto y no inventarla.'
  }
] as const

export async function ensureTelarAIKnowledge(businessId: string) {
  const existingEntries = await prisma.$queryRaw<Array<{ id: string; title: string; content: string }>>`
    SELECT "id", "title", "content" FROM "KnowledgeBase"
    WHERE "businessId" = ${businessId} AND "isEditable" = false
    ORDER BY "title" ASC, "id" ASC
  `
  const existingByTitle = new Map(existingEntries.map(item => [item.title, item]))

  for (const entry of TELAR_AI_KNOWLEDGE) {
    const existing = existingByTitle.get(entry.title)

    if (!existing) {
      await prisma.$executeRaw`
        INSERT INTO "KnowledgeBase" ("id", "businessId", "title", "content", "isEditable")
        VALUES (${randomUUID()}, ${businessId}, ${entry.title}, ${entry.content}, false)
      `
      continue
    }

    if (existing.content !== entry.content) {
      await prisma.$executeRaw`
        UPDATE "KnowledgeBase" SET "content" = ${entry.content}
        WHERE "id" = ${existing.id} AND "businessId" = ${businessId} AND "isEditable" = false
      `
    }
  }

  const officialTitles: string[] = TELAR_AI_KNOWLEDGE.map(entry => entry.title)
  for (const staleEntry of existingEntries) {
    if (!officialTitles.includes(staleEntry.title)) {
      await prisma.$executeRaw`
        DELETE FROM "KnowledgeBase"
        WHERE "id" = ${staleEntry.id} AND "businessId" = ${businessId} AND "isEditable" = false
      `
    }
  }

  for (const entry of TELAR_AI_KNOWLEDGE) {
    await prisma.$executeRaw`
      DELETE FROM "KnowledgeBase"
      WHERE "businessId" = ${businessId}
        AND "title" = ${entry.title}
        AND "isEditable" = false
        AND "id" NOT IN (
          SELECT "id" FROM "KnowledgeBase"
          WHERE "businessId" = ${businessId}
            AND "title" = ${entry.title}
            AND "isEditable" = false
          ORDER BY "id" ASC
          LIMIT 1
        )
    `
  }

  return prisma.knowledgeBase.findMany({
    where: { businessId },
    orderBy: { title: 'asc' }
  })
}
