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
- [ ] Acceso horizontal entre Business/Profiles/Tags.
- [ ] Rate limiting y fuerza bruta.
- [ ] CSRF con sesiones por cookie.
