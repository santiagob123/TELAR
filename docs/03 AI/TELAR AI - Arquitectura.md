# TELAR AI - Arquitectura

## Flujo principal

```text
ChatBubble en `/` -> /api/chat/message
      -> getAIContext()
      -> handleIncoming()
      -> answerMessage()
      -> fast_path/security_path/KB/provider/fallback
      -> guarda Message AI
```

## Servicios

- `context.ts`: encuentra o crea el Business técnico y sincroniza KB oficial.
- `conversation.ts`: abre o reutiliza conversación, persiste mensajes y llama a `answerMessage`.
- `index.ts`: selecciona ruta de respuesta, KB, historial y provider.
- `provider.ts`: abstrae Ollama, OpenAI, Gemini y fallback.
- `knowledge.ts`: declara y sincroniza el conocimiento oficial.

## Canales

- ChatBubble en `/`: canal web público canónico; `/chat` redirige a `/`.
- `/ai`: entorno interno protegido.
- n8n: endpoints privados.
- WhatsApp: preparación/demo existente, pero no hay integración real.

## Persistencia y exportación

- `Conversation` y `Message` se persisten en backend.
- El historial enviado al provider se limita a los últimos seis mensajes.
- La exportación administrativa actual es JSON en `/api/ai/conversations/export-json`.
- Agrupa por conversación, ordena conversaciones por última actividad descendente y mensajes cronológicamente.
- Los filtros `from` y `to` usan fechas de calendario `America/Bogota` y se convierten a límites UTC.
