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
- Exportación administrativa únicamente en JSON, agrupada por conversación.
- Filtros de conversaciones por fecha interpretados como calendario `America/Bogota`.
- El login individual comparte sesión por usuario; el contexto AI y las conversaciones privadas se filtran por propietario. `AI_TOKEN`/`AI_USER_ID` siguen como compatibilidad temporal.
- El endpoint interno de mensajes resuelve el contexto en servidor y no confía en un `businessId` enviado por el cliente.

## Funcionalidad pendiente

- WhatsApp real mediante Cloud API.

## UX

- El ChatBubble no recupera visualmente mensajes al recargar.
- Ollama puede producir latencias largas.
- Mejorar entrada para mensajes largos y estados de carga.

## Hardening y QA

- Completar pruebas automatizadas de aislamiento entre propietarios.
- Rate limiting, observabilidad y tests automatizados.
- Asignar de forma controlada cualquier contexto o conversación histórica cuyo negocio no tenga propietario.

Ver: [[TELAR AI - Arquitectura]] y [[Pendientes AI]].
