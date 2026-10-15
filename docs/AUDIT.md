# Auditoría funcional

| Área | Funcionalidad | Estado | Evidencia | Pendiente | Prioridad |
|---|---|---|---|---|---|
| TAG | Página pública activa e inactiva (P1 #1) | COMPLETA | lib/public-tag.ts:54,57; pages/tag/[id].tsx:17 | P2 pendiente: evaluar 404 HTTP dedicado en SSR (pages/tag/[id].tsx:157) | P2 |
| TAG | GET /api/tags/[id] público | COMPLETA | pages/api/tags/[id].ts:9,12 | — | — |
| TAG | NFC físico (lectura real) | PENDIENTE | — | Bloqueado: sin permiso/credencial externa | P1 |
| Conversaciones | Derivación a una persona (backend + UI) | COMPLETA | services/ai/conversation.ts:28,67; pages/ai/conversations.tsx:193 | — | — |
| Conversaciones | POST /api/ai/conversations/[id]/messages | COMPLETA | pages/api/ai/conversations/[id]/messages.ts:10,35 | — | — |
| Conversaciones | Composer de respuesta humana en /ai | COMPLETA | pages/ai/conversations.tsx:112,214 | — | — |
| Conversaciones | Reabrir asistente desde UI | COMPLETA | pages/ai/conversations.tsx:134,195 | — | — |
| TELAR AI | Pantalla interna /ai con handoff visible | COMPLETA | pages/ai/index.tsx:67,69 | — | — |
| Chat público | Respuesta con handedOff | COMPLETA | pages/api/chat/message.ts:34,35 | — | — |
| Chat público | Aviso de sistema cuando handedOff=true | COMPLETA | components/usePublicChat.ts:3,36,37 | — | — |
| Auth | Login individual con aislamiento por propietario | PARCIAL | lib/user-session.ts; lib/admin-auth.ts; lib/ai-auth.ts; pages/api/admin/login.ts; pages/api/ai/login.ts | Cuenta demo, asignaciones aprobadas y `SESSION_SECRET` local/Vercel Production listos; falta desplegar código y retirar tokens globales tras validar | P1 |
| Auth | Backfill ownerId históricos | PENDIENTE DE REVISIÓN | scripts/backfill-owner.ts; consulta de negocios a Supabase | Propuesta de cuatro negocios sin owner a la cuenta demo; pendiente aprobación, aún sin asignar | P1 |
| Integraciones | WhatsApp Cloud API real | PENDIENTE | — | Bloqueado: sin número WhatsApp Business | P1 |
| Integraciones | Gmail vía n8n | PARCIAL | Workflow n8n externo | One-way; sin persistencia en TELAR; no versionado en repo | P1 |
| Integraciones | Rotar y asegurar x-n8n-secret | PENDIENTE | Workflow Gmail externo | P0 de seguridad | P0 |
| Integraciones | Idempotencia n8n chat | PARCIAL | pages/api/integrations/n8n/chat.ts; services/ai/conversation.ts; prisma/schema.prisma | Migración aplicada en Supabase configurada; el workflow debe enviar `Idempotency-Key` | P1 |
| Integraciones | Persistir clasificaciones n8n en TELAR | PARCIAL | pages/api/integrations/n8n/classify.ts; prisma/schema.prisma | Migración aplicada; n8n debe enviar `externalId` | P1 |
| Integraciones | Versionar workflow Gmail en repo | PENDIENTE | Workflow n8n externo | — | P1 |
| Producción | Rate limit chat público + APIs sensibles | PARCIAL | lib/rate-limit.ts; pages/api/chat/message.ts; pages/api/ai/message.ts; pages/api/integrations/n8n/chat.ts; pages/api/integrations/n8n/classify.ts | Ocho migraciones verificadas en Supabase configurada; código local pendiente de despliegue | P1 |
| Producción | Backups + health + alertas | PARCIAL | pages/api/health.ts | Falta monitor externo, backups y recuperación | P1 |
| Doc | DIRECT_URL en .env.example | COMPLETA | .env.example | — | — |
| Doc | README actualizado | COMPLETA | README.md | — | — |
| AI | Timeout explícito de OpenAI | COMPLETA | services/ai/provider.ts; .env.example | — | — |
| AI | Lectura de contexto sin escrituras implícitas | COMPLETA | services/ai/context.ts; pages/api/ai/init.ts | — | — |
| Producción | Endpoint de readiness | PARCIAL | pages/api/health.ts | Falta monitor externo y alertas | P2 |
| TAG | Edición de nombre del negocio | COMPLETA | pages/api/profiles/[id].ts; pages/admin/profile.tsx | — | — |
| TAG | 404 HTTP para TAG inexistente | COMPLETA | pages/tag/[id].tsx | — | — |
| AI | UI y sincronización de Knowledge Base | PARCIAL | pages/ai/knowledge.tsx; pages/api/ai/knowledge.ts; services/ai/knowledge.ts | Migración de `isEditable` aplicada en Supabase configurada; código local pendiente de despliegue | P2 |
| Conversaciones | Paginación de conversaciones y mensajes | PARCIAL | lib/ai-conversations.ts; pages/api/ai/conversations.ts; pages/api/ai/conversations/[id]/messages.ts; pages/ai/conversations.tsx | Índice aplicado en Supabase configurada; verificar en entornos adicionales y desplegar código | P2 |
| Limpieza | Redirección de rutas AI legacy | COMPLETA | middleware.ts | — | — |
| QA | Tests E2E reales | PENDIENTE | — | No se ejecutaron ni añadieron pruebas en esta tarea | P2 |

## Integraciones externas (fuera del repo)

- Gmail vía n8n: workflow activo y one-way. Flujo: Gmail Trigger → obtener mensaje → comprobar duplicado mediante etiqueta TELAR/Procesado → clasificar con TELAR AI → aplicar reglas de prioridad y categoría → etiquetar → archivar o marcar importante según las reglas → marcar procesado.
- El workflow no persiste las clasificaciones de vuelta en TELAR y aún no está versionado en este repo.

## Bloqueos externos

- WhatsApp Cloud API: bloqueado hasta disponer de un número de WhatsApp Business.
- NFC físico: bloqueado hasta disponer de permiso o credencial externa.

## Deuda de seguridad

- P0: rotar `x-n8n-secret` expuesto en el workflow Gmail y moverlo a credentials de n8n (deuda introducida por configuración manual, no por código del repo).
- P1: `ADMIN_TOKEN` y `AI_TOKEN` permanecen como compatibilidad temporal; retirarlos después del despliegue y validación del acceso por usuario.
