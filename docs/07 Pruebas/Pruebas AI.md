# Pruebas AI

## Confirmado en pruebas previas

- Preguntas normales sobre TELAR/TAG/AI, información no confirmada, continuidad conversacional e historial limitado a seis mensajes.
- Fast-path para saludos/despedidas y normalización de marca.
- Pruebas de ownership/handoff con Prisma simulado en `tests/ownership.test.cjs`.
- En Vercel Production, autenticación por token de compatibilidad y respuestas 200 de APIs de conversaciones y Knowledge Base.

## Alcance no cubierto por esa evidencia

Las pruebas anteriores no cubren una sesión de propietario ni E2E. La carga/concurrencia, providers lentos o caídos y pruebas con cuenta propietaria necesitan configuración de provider y un ambiente con credenciales/datos aislados. El historial visual tras recargar sí se restaura localmente en la misma pestaña mediante `sessionStorage`.
