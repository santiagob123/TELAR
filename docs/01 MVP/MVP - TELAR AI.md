# MVP - TELAR AI

## Estado

🟢 Núcleo implementado; WhatsApp real pendiente.

TELAR AI dispone de chat público, entorno interno, persistencia de conversaciones, selección de conocimiento, historial reciente, fast-path, security-path, providers configurables y fallback.

## Confirmado en código

- ChatBubble público en `/`; `/chat` ya no es una interfaz y redirige a `/`.
- Entorno interno bajo `/ai`.
- Conversaciones y mensajes persistidos con Prisma.
- Historial limitado a seis mensajes previos enviados al provider.
- Providers Ollama, OpenAI, Gemini y fallback.
- Selección automática de KB relevante.
- Exportación administrativa únicamente en JSON mediante `/api/ai/conversations/export-json`, agrupada por conversación y respetando filtros de fecha en `America/Bogota`.
- Integración privada con n8n.

## Funcionalidad pendiente

- Integración real de WhatsApp Cloud API.

## UX y operación

- Recuperación visual del historial del ChatBubble después de recargar.
- Mejor feedback ante providers lentos y mensajes largos.

## Hardening y QA

- Ownership/autorización por recurso, rate limiting, idempotencia n8n, observabilidad, backups y tests automatizados.

Ver: [[TELAR AI - Estado]], [[TELAR AI - Arquitectura]], [[Providers]].
