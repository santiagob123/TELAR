# Fast Path

## Estado

🟢 Implementado

`answerMessage()` reconoce saludos, agradecimientos, confirmaciones y despedidas casuales antes de cargar KB o llamar al provider.

Ejemplos confirmados en pruebas previas:

- `hola`;
- `hola como vamos`;
- `gracias`;
- `perfecto`;
- `ok`;
- `chao`;
- `hasta luego`.

Emite el log `fast_path` y no debe emitir `provider_request`.
