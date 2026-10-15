# Bugs

> Añadir una entrada cuando exista evidencia suficiente para reproducirla. No convertir comentarios generales de retro en bugs confirmados.

## Por clasificar de la retro

| Estado | Información necesaria | Registro |
|---|---|---|
| Esperando detalle | Pantalla/componente, pasos para reproducir, resultado actual y esperado, frecuencia y evidencia (captura/video si existe). | Aún no se han recibido casos concretos. |

## Confirmados por pruebas previas

_No hay casos documentados en esta sección._

## UX / mejoras conocidas

- [ ] El ChatBubble no restaura el historial visible después de recargar; la persistencia backend sí está implementada.
- [ ] Ollama puede mantener la UI en `Enviando...` durante una espera larga.
- [ ] Mensajes largos usan un input de una sola línea en el ChatBubble.

## Observaciones por verificar

- [ ] Antes de retirar la UI independiente, se observó un 404 puntual al recargar `/chat`; actualmente `/chat` redirige a `/`. Reproducibilidad histórica: por verificar.
- [ ] Variantes de nombre producidas por Ollama fueron corregidas con normalización acotada; mantener prueba de regresión.
