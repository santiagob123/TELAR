# Providers

## Estado

🟢 Implementados parcialmente

`services/ai/provider.ts` soporta:

- Ollama mediante `/api/chat`;
- OpenAI mediante el SDK `openai`;
- Gemini mediante `generateContent`;
- fallback determinista cuando se selecciona `fallback` o no hay OpenAI configurado.

Ollama y Gemini tienen timeout de 60 segundos. OpenAI no define un timeout explícito en esta capa.

## Manejo de errores

- Respuesta HTTP no exitosa: error.
- Respuesta vacía: error.
- `answerMessage()` registra el error y usa fallback.
- n8n classification devuelve `502` si la respuesta no es JSON válido.

## Por verificar

- Rate limits reales.
- Reintentos.
- Observabilidad de producción.
