# TELAR AI - Estado

## Estado

🟢 Núcleo implementado; WhatsApp real pendiente.

## Confirmado

- ChatBubble público en `/`; `/chat` redirige a `/` y no es una interfaz disponible.
- Área interna protegida bajo `/ai`.
- Conversaciones y mensajes persistidos.
- Knowledge Base asociada al Business técnico `TELAR AI`.
- Providers Ollama, OpenAI, Gemini y fallback.
- Fast-path y security-path deterministas.
- Historial reciente limitado a seis mensajes previos.
- Selección automática de KB relevante.
- Exportación de conversaciones a JSON y CSV; la UI permite imprimir/guardar como PDF con el navegador.
- Filtros de conversaciones por fecha interpretados como calendario `America/Bogota`.
- El login individual comparte sesión por usuario; el contexto AI y las conversaciones privadas se filtran por propietario. `AI_TOKEN`/`AI_USER_ID` siguen como compatibilidad temporal.
- El endpoint interno de mensajes resuelve el contexto en servidor y no confía en un `businessId` enviado por el cliente.

## Funcionalidad pendiente

- WhatsApp real mediante Cloud API.

## UX

- El ChatBubble restaura hasta 100 mensajes en la misma pestaña, no entre dispositivos.
- Validar feedback ante providers realmente lentos/caídos y revisar UX móvil.

## Hardening y QA

- Completar pruebas automatizadas de aislamiento entre propietarios.
- Rate limiting está implementado y desplegado; verificar cada entorno. Observabilidad externa, alertas, backups y E2E siguen pendientes.
- Revisar cualquier contexto/conversación histórica sin propietario antes de un backfill; no asignar sin mapping aprobado.

Ver: [[TELAR AI - Arquitectura]] y [[Pendientes AI]].
