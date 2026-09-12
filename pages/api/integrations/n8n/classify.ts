import { NextApiRequest, NextApiResponse } from 'next'
import { generateAIResponse, getAIProvider } from '../../../../services/ai/provider'

type Classification = {
  categoria: 'empleo' | 'spam' | 'red_social' | 'suscripcion' | 'factura' | 'promocion' | 'personal' | 'trabajo' | 'seguridad' | 'notificacion' | 'otro'
  prioridad: 'alta' | 'media' | 'baja'
  resumen: string
  requiere_accion: boolean
  accion_sugerida: 'responder' | 'revisar' | 'archivar' | 'eliminar' | 'ignorar' | 'guardar' | 'ninguna'
}

const MAX_MESSAGE_LENGTH = 2000
const CATEGORIES = new Set<Classification['categoria']>([
  'empleo', 'spam', 'red_social', 'suscripcion', 'factura', 'promocion',
  'personal', 'trabajo', 'seguridad', 'notificacion', 'otro'
])
const PRIORITIES = new Set<Classification['prioridad']>(['alta', 'media', 'baja'])
const ACTIONS = new Set<Classification['accion_sugerida']>([
  'responder', 'revisar', 'archivar', 'eliminar', 'ignorar', 'guardar', 'ninguna'
])

const CLASSIFICATION_PROMPT = `Eres un clasificador de correos electrónicos.

Tu única tarea es analizar el correo proporcionado y devolver una clasificación estructurada.
No respondas al correo. No converses con el usuario. No respondas como asistente de TELAR.
No utilices la KnowledgeBase de TELAR. No inventes información. No expliques tu razonamiento.
Devuelve exclusivamente un objeto JSON válido, sin Markdown ni texto adicional.

Categorías permitidas: empleo, spam, red_social, suscripcion, factura, promocion, personal, trabajo, seguridad, notificacion, otro.
Prioridades permitidas: alta, media, baja.
Acciones permitidas: responder, revisar, archivar, eliminar, ignorar, guardar, ninguna.

Criterios:
- empleo: vacantes, ofertas laborales, postulaciones, candidatos, reclutamiento o entrevistas.
- trabajo: proyectos, desarrollo, sprints, tareas, reuniones, entregas, bloqueos o producción.
- promocion: descuentos, cupones, ofertas comerciales o compras.
- factura: facturas, cobros, pagos, recibos, vencimientos o saldos.
- seguridad: inicios de sesión, contraseñas, verificaciones, alertas o accesos no autorizados.
- suscripcion: newsletters, boletines o cancelaciones de suscripción.
- red_social: redes sociales, conexiones, seguidores o menciones.
- notificacion: notificación automática que no encaje claramente en otra categoría.
- personal: comunicación personal entre personas.
- spam: correo claramente no deseado, fraudulento o sospechoso que no encaje mejor en seguridad.
- otro: solo si no encaja claramente en las categorías anteriores.

Prioridad alta: urgencia, fecha límite, deadline, incidente, bloqueo, producción caída, problema crítico, acción inmediata, entrega crítica o solicitud urgente. No uses alta solo por la palabra "importante" fuera de contexto.
Prioridad media: tareas pendientes, reuniones normales, seguimientos, facturas, solicitudes que requieren revisión o asuntos de trabajo sin urgencia.
Prioridad baja: newsletters, promociones, redes sociales, correos informativos, ofertas comerciales o correos sin acción requerida.

requiere_accion debe ser true si hay que responder, asistir a una reunión, revisar información, completar una tarea, pagar, revisar una alerta o entregar un documento. En otro caso debe ser false.
accion_sugerida debe ser responder cuando se necesita contestar, revisar cuando requiere atención manual, archivar cuando no debe permanecer en la bandeja principal, eliminar cuando sea claramente spam, ignorar cuando no requiere atención, guardar cuando conviene conservarlo y ninguna cuando no requiere acción.

Devuelve exactamente estas propiedades JSON: categoria, prioridad, resumen, requiere_accion, accion_sugerida.`

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function extractJsonObject(value: string): string | null {
  const withoutFence = value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  const start = withoutFence.indexOf('{')
  const end = withoutFence.lastIndexOf('}')
  return start >= 0 && end > start ? withoutFence.slice(start, end + 1) : null
}

function parseClassification(value: string): Classification | null {
  const json = extractJsonObject(value)
  if (!json) return null

  try {
    const parsed: unknown = JSON.parse(json)
    if (!isRecord(parsed)) return null

    const { categoria, prioridad, resumen, requiere_accion: requiresAction, accion_sugerida: suggestedAction } = parsed
    if (
      typeof categoria !== 'string' || !CATEGORIES.has(categoria as Classification['categoria']) ||
      typeof prioridad !== 'string' || !PRIORITIES.has(prioridad as Classification['prioridad']) ||
      typeof resumen !== 'string' || !resumen.trim() ||
      typeof requiresAction !== 'boolean' ||
      typeof suggestedAction !== 'string' || !ACTIONS.has(suggestedAction as Classification['accion_sugerida'])
    ) {
      return null
    }

    return {
      categoria: categoria as Classification['categoria'],
      prioridad: prioridad as Classification['prioridad'],
      resumen: resumen.trim(),
      requiere_accion: requiresAction,
      accion_sugerida: suggestedAction as Classification['accion_sugerida']
    }
  } catch {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const configuredSecret = process.env.N8N_WEBHOOK_SECRET
  const receivedSecret = req.headers['x-n8n-secret']
  if (!configuredSecret || typeof receivedSecret !== 'string' || receivedSecret !== configuredSecret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body = req.body
  if (!isRecord(body)) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  const allowedKeys = new Set(['text', 'subject', 'from'])
  if (Object.keys(body).some(key => !allowedKeys.has(key))) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  const { text, subject, from } = body
  if (
    typeof text !== 'string' || !text.trim() || text.trim().length > MAX_MESSAGE_LENGTH ||
    (subject !== undefined && typeof subject !== 'string') ||
    (from !== undefined && typeof from !== 'string')
  ) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  const classifierInput = [
    `ASUNTO:\n${subject || '(sin asunto)'}`,
    `REMITENTE:\n${from || '(remitente no disponible)'}`,
    `CONTENIDO:\n${text.trim()}`
  ].join('\n\n')

  try {
    const startedAt = Date.now()
    const rawResponse = await generateAIResponse([
      { role: 'system', content: CLASSIFICATION_PROMPT },
      { role: 'user', content: classifierInput }
    ])
    const classification = parseClassification(rawResponse)

    console.info('[TELAR AI] n8n_classify', {
      provider: getAIProvider(),
      durationMs: Date.now() - startedAt,
      responseChars: rawResponse.length,
      valid: Boolean(classification)
    })

    if (!classification) {
      return res.status(502).json({ error: 'AI classification failed' })
    }

    return res.status(200).json(classification)
  } catch (error) {
    console.error('[TELAR AI] n8n_classify_error', {
      provider: getAIProvider(),
      message: error instanceof Error ? error.message : 'Error desconocido'
    })
    return res.status(502).json({ error: 'AI classification failed' })
  }
}
