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

## Funcionalidad pendiente

- WhatsApp real mediante Cloud API.

## UX

- El ChatBubble no recupera visualmente mensajes al recargar.
- Ollama puede producir latencias largas.
- Mejorar entrada para mensajes largos y estados de carga.

## Hardening y QA

- Ownership/autorización por recurso, rate limiting, observabilidad y tests automatizados.

Ver: [[TELAR AI - Arquitectura]] y [[Pendientes AI]].
