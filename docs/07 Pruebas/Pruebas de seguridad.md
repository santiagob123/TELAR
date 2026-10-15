# Pruebas de seguridad

## Confirmado en pruebas previas

- [x] System prompt rechazado antes del provider.
- [x] Instrucciones internas rechazadas.
- [x] API key y variables de entorno rechazadas.
- [x] Código interno y configuración sensible rechazados.
- [x] Intento de ignorar instrucciones rechazado.
- [x] No se observó `provider_request` en las solicitudes sensibles cubiertas.

## Por ejecutar

- [ ] Variaciones lingüísticas y errores tipográficos.
- [ ] Ataques mediante historial.
- [ ] Validar en runtime acceso horizontal entre Business/Profiles/Tags con dos `User` y tokens configurados.
- [ ] Validar en runtime acceso horizontal entre conversaciones AI y exportaciones.
- [ ] Validar rechazo `503` cuando falta o no existe `ADMIN_USER_ID`/`AI_USER_ID`.
- [ ] Rate limiting y fuerza bruta.
- [ ] CSRF con sesiones por cookie.
