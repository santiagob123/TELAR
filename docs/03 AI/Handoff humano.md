# Handoff humano

## Resumen

El estado `human` en `Conversation` suspende la respuesta automática de TELAR AI para las entradas siguientes y permite que un operador responda manualmente desde `/ai/conversations` (`services/ai/conversation.ts:66,67`; `pages/ai/conversations.tsx:208,214`). Chat público y n8n reciben `handedOff: true` con `aiReply: null` durante el handoff (`pages/api/chat/message.ts:32,34,35`; `pages/api/integrations/n8n/chat.ts:40,42,43`).

**Estado:** COMPLETA
**Fecha:** 2026-09-30
**P1 #4:** RESUELTO

## Diagrama de estados

```text
[open] --derivar (PATCH state='human')--> [human]
[human] --mensaje entrante: persiste, sin respuesta AI--> [human]
[human] --respuesta del operador--> [human]
[human] --reabrir (PATCH state='open')--> [open]
```

La UI permite derivar y reabrir mediante PATCH; el servicio mantiene la conversación en `human` mientras procesa entradas del canal (`pages/ai/conversations.tsx:83,86,134,141`; `services/ai/conversation.ts:24,28,66,67`).

## Flujo por canal

- **Chat público:** `POST /api/chat/message` pasa `public:<sessionId>` a `handleIncoming()`. En handoff responde HTTP 200 con `handedOff: true` y `aiReply: null`; `usePublicChat` añade el aviso de sistema con `kind: 'system'` sin insertar una respuesta AI (`pages/api/chat/message.ts:31,32,34,35`; `components/usePublicChat.ts:36,37`).
- **n8n:** `POST /api/integrations/n8n/chat` pasa `n8n:<sessionId>` a `handleIncoming()` y responde HTTP 200 con el mismo contrato de handoff (`pages/api/integrations/n8n/chat.ts:39,40,42,43`).
- **`/api/ai/message`:** requiere usuario AI, pasa `from` y `text` a `handleIncoming()` y devuelve el resultado del servicio, incluido `handedOff` (`pages/api/ai/message.ts:8,9,11,22,23`).
- **`/ai/conversations`:** el operador ve las conversaciones `human`, envía respuestas por el endpoint humano y puede reabrir el asistente con PATCH a `state: 'open'` (`pages/ai/conversations.tsx:112,141,193,195,208,214`).

## Contrato del endpoint

`POST /api/ai/conversations/[id]/messages` recibe `{ text: string }` y aplica estas respuestas:

- **401:** falta auth AI válida (`pages/api/ai/conversations/[id]/messages.ts:10`; `lib/ai-auth.ts:10,11,15`).
- **400:** `text` no es string, está vacío tras `trim()` o supera 2000 caracteres (`pages/api/ai/conversations/[id]/messages.ts:5,15,17,18`).
- **404:** no encuentra la conversación bajo el owner autenticado. La consulta filtra por `business.ownerId`, por lo que no revela si una conversación ajena existe (`pages/api/ai/conversations/[id]/messages.ts:22,23,27`).
- **409:** la conversación no está en `state: 'human'` (`pages/api/ai/conversations/[id]/messages.ts:28,29`).
- **200:** persiste `from: 'human'` e `isFromAI: false`, y devuelve exactamente seis campos: `id`, `conversationId`, `from`, `text`, `isFromAI` y `createdAt` (`pages/api/ai/conversations/[id]/messages.ts:33,35,37,39,40,41,42,43,44,45,49`).

## Reglas para futuras sesiones

- Si `handedOff === true`, no inyectar una respuesta AI en ningún canal (`services/ai/conversation.ts:66,67`; `pages/api/chat/message.ts:34,35`; `pages/api/integrations/n8n/chat.ts:42,43`).
- `handleIncoming()` busca `human` primero, luego `open` y crea una conversación nueva solo si no encuentra ninguna (`services/ai/conversation.ts:24,28,30,36,40`).
- El endpoint humano solo escribe cuando `state === 'human'`; las conversaciones inexistentes o ajenas devuelven 404 (`pages/api/ai/conversations/[id]/messages.ts:22,23,27,28,35,37`).
- Reabrir es una acción explícita del operador mediante PATCH a `state: 'open'`; enviar una respuesta humana no reabre por sí solo (`pages/ai/conversations.tsx:134,138,141`).

## Archivos clave

1. `services/ai/conversation.ts:24,30,60,62,66,67,71` — selección de conversación, persistencia entrante y bifurcación de handoff.
2. `pages/api/ai/conversations/[id]/messages.ts:10,17,22,27,28,35,37,49` — endpoint autenticado para respuesta humana.
3. `pages/api/ai/message.ts:8,11,22,23` — entrada de mensajes de TELAR AI.
4. `pages/api/chat/message.ts:31,32,34,35` — contrato de chat público.
5. `pages/api/integrations/n8n/chat.ts:39,40,42,43` — contrato de chat n8n.
6. `components/usePublicChat.ts:36,37` — aviso público de handoff.
7. `pages/ai/index.tsx:67,69,72` — handoff visible en simulación interna.
8. `pages/ai/conversations.tsx:112,141,193,208,214` — responder, reabrir y composer.

## Tests relacionados

Los cinco tests focalizados están en `tests/ownership.test.cjs` y usan Prisma simulado:

- Reutilizar conversación `human`, no llamar AI, persistir entrada y devolver handoff: línea 414.
- Conversación `open` continúa con AI y devuelve `handedOff: false`: línea 449.
- Endpoint humano: auth, validación, ownership, estado y respuesta con seis campos: línea 464.
- Chat público devuelve handoff sin respuesta AI: línea 494.
- n8n devuelve handoff sin respuesta AI: línea 528.

## Relación con otros documentos

- `CONTEXT.md` — arquitectura, flujos y reglas para futuras sesiones.
- `docs/AUDIT.md` — estado de handoff y endpoints.
- `docs/PENDIENTES.md` — backlog priorizado.
- `docs/03 AI/Integración Gmail vía n8n.md` — integración externa Gmail.
