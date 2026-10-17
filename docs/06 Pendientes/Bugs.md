# Bugs

> Registrar cada bug solo con evidencia reproducible; no convertir comentarios generales de retro en defectos confirmados.

## Retro pendiente de recibir

| Estado | Información necesaria | Registro |
|---|---|---|
| Esperando detalle | Pantalla/componente, pasos, resultado actual y esperado, frecuencia, captura/video si existe | Aún no se recibieron casos concretos. |

## Comportamiento conocido

- ChatBubble restaura hasta 100 mensajes en la misma pestaña con `sessionStorage`; entre dispositivos no sincroniza historial visual.
- El backend persiste `Conversation`/`Message`; el provider usa hasta seis mensajes previos para contexto.
- El ChatBubble muestra estado al esperar provider y limita entradas largas. Latencias reales de provider requieren validación con las credenciales/configuración del entorno correspondiente.
- `/chat` redirige a `/`; el 404 histórico al recargar esa ruta no tiene pasos reproducibles y no está confirmado como bug actual.
- La normalización de nombres de Ollama está implementada; su regresión debe cubrirse con el set de pruebas del provider cuando se habilite ese entorno.
