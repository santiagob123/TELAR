# Bugs

## Confirmados por pruebas previas

## UX / mejoras conocidas

- [ ] El ChatBubble no restaura el historial visible después de recargar; la persistencia backend sí está implementada.
- [ ] Ollama puede mantener la UI en `Enviando...` durante una espera larga.
- [ ] Mensajes largos usan un input de una sola línea en el ChatBubble.

## Observaciones

- [ ] Antes de retirar la UI independiente, se observó un 404 puntual al recargar `/chat`; actualmente `/chat` redirige a `/`. Reproducibilidad histórica: ⚪ Por verificar.
- [ ] Variantes de nombre producidas por Ollama fueron corregidas con normalización acotada; mantener prueba de regresión.
