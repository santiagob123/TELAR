import prisma from '../../lib/prisma'

export const TELAR_AI_KNOWLEDGE = [
  {
    title: 'Qué es TELAR',
    content: 'TELAR es una aplicación Next.js y TypeScript que contiene dos MVP independientes: TELAR TAG y TELAR AI. Utiliza Prisma para persistencia y TailwindCSS para la interfaz.'
  },
  {
    title: 'TELAR TAG',
    content: 'TELAR TAG permite gestionar perfiles digitales de negocios y tags identificados por un identificador público. El proyecto incluye administración de perfiles y tags, generación de códigos QR para tags y páginas públicas de tag. El estado de un tag puede ser active o inactive.'
  },
  {
    title: 'TELAR AI',
    content: 'TELAR AI es el asistente virtual independiente de TELAR. Tiene un chat público en /chat y un entorno interno protegido en /ai. Ambos utilizan el mismo núcleo de conversaciones: handleIncoming, answerMessage y un proveedor de IA configurable.'
  },
  {
    title: 'Cómo utiliza el conocimiento TELAR AI',
    content: 'TELAR AI carga los bloques de KnowledgeBase asociados exclusivamente al Business técnico TELAR AI y los envía al proveedor como contexto. La KnowledgeBase es la fuente principal de verdad para las preguntas específicas sobre TELAR.'
  },
  {
    title: 'Conversaciones e historial',
    content: 'Las conversaciones y sus mensajes se guardan en la base de datos. El historial conserva mensajes de usuario y asistente en orden cronológico, y se envían hasta los últimos diez mensajes previos al proveedor para mantener contexto entre turnos.'
  },
  {
    title: 'Proveedores de IA',
    content: 'El proveedor se selecciona mediante AI_PROVIDER. El proyecto admite Ollama local, OpenAI y fallback. Ollama utiliza OLLAMA_BASE_URL y OLLAMA_MODEL; OpenAI utiliza OPENAI_API_KEY y OPENAI_MODEL. Si el proveedor falla, el sistema utiliza el fallback basado en KnowledgeBase.'
  },
  {
    title: 'WhatsApp y limitaciones actuales',
    content: 'La pantalla interna de TELAR AI indica que utiliza una simulación interna y no representa una integración real con WhatsApp. El repositorio también identifica la integración real de WhatsApp como pendiente. No hay en el proyecto información verificada sobre precios, clientes, horarios ni datos de contacto comerciales de TELAR.'
  },
  {
    title: 'Respuestas sobre información no disponible',
    content: 'Cuando una pregunta requiere información específica de TELAR que no está en la KnowledgeBase, TELAR AI debe reconocer que no tiene esa información disponible y recomendar contactar con el equipo, sin inventar funcionalidades, precios, integraciones ni datos empresariales.'
  }
] as const

export async function ensureTelarAIKnowledge(businessId: string) {
  for (const entry of TELAR_AI_KNOWLEDGE) {
    const existing = await prisma.knowledgeBase.findFirst({
      where: { businessId, title: entry.title }
    })

    if (existing) {
      await prisma.knowledgeBase.update({
        where: { id: existing.id },
        data: { content: entry.content }
      })
    } else {
      await prisma.knowledgeBase.create({
        data: { businessId, title: entry.title, content: entry.content }
      })
    }
  }

  return prisma.knowledgeBase.findMany({
    where: { businessId },
    orderBy: { title: 'asc' }
  })
}