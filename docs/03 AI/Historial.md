# Historial

## Estado

🟢 Implementado parcialmente

`handleIncoming()` persiste mensajes en `Conversation` y `Message`. `answerMessage()` carga mensajes previos ordenados por `createdAt`, excluye el mensaje actual por su ID y usa los últimos seis mensajes no vacíos.

Los logs registran:

- `availableHistoryCount`;
- `selectedHistoryCount`;
- caracteres seleccionados;
- roles seleccionados.

## Limitación de UI

El backend persiste `Conversation` y `Message`, y el provider recibe hasta los seis mensajes previos de la conversación. El ChatBubble mantiene la vista actual en estado React y `sessionStorage` solo para el identificador de sesión; todavía no recupera visualmente el historial después de recargar. Esto es una mejora UX, no una falta de persistencia backend.
