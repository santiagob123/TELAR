export const MODE = process.env.WHATSAPP_MODE || 'demo'

// Re-exportación para preservar compatibilidad con cualquier importación preexistente
export { handleIncoming } from '../ai/conversation'
