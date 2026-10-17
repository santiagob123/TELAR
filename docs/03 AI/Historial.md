# Historial

## Estado

🟢 Implementado parcialmente

`handleIncoming()` persiste mensajes en `Conversation` y `Message`. `answerMessage()` carga mensajes previos ordenados por `createdAt`, excluye el mensaje actual por su ID y usa los últimos seis mensajes no vacíos.

Los logs registran:

- `availableHistoryCount`;
- `selectedHistoryCount`;
- caracteres seleccionados;
- roles seleccionados.

## Restauración en la interfaz

El ChatBubble persiste el identificador de sesión y los últimos 100 mensajes en `sessionStorage`. Al recargar la misma pestaña, restaura la vista local mientras conserva la persistencia backend en `Conversation` y `Message`. No se sincroniza el historial visual entre dispositivos ni navegadores.

La selección de contexto para el provider usa hasta los seis mensajes anteriores no vacíos; ese límite es independiente de los 100 mensajes visibles restaurados por el cliente.
