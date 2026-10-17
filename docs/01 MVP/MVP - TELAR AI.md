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
- Exportación administrativa JSON/CSV agrupada por conversación; la UI permite imprimir/guardar como PDF desde el navegador. Los filtros de fecha usan `America/Bogota`.
- Integración privada con n8n.

## Funcionalidad pendiente

- Integración real de WhatsApp Cloud API.

## UX y operación

- Historial visual restaurado en la misma pestaña (hasta 100 mensajes); validar comportamiento entre dispositivos si se requiere.
- Probar UX con providers realmente lentos/caídos y revisar mobile.

## Hardening y QA

- Ownership/autorización, rate limiting e idempotencia backend están implementados y desplegados. Pendientes: validar límites/aislamiento en entornos reales, configurar idempotencia en el workflow externo, observabilidad, backups y pruebas E2E.

Ver: [[TELAR AI - Estado]], [[TELAR AI - Arquitectura]], [[Providers]].
