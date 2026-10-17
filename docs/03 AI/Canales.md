# Canales

## Estado

🟢 Canal web implementado; WhatsApp real pendiente.

### Confirmado

- ChatBubble en `/`: chat público canónico; `/chat` redirige a `/` y no es un canal separado.
- `/ai`: entorno interno protegido.
- n8n: endpoints privados de integración/preparación para chat y clasificación.

### En prueba o no confirmado

- Gmail vía n8n está activo como canal externo one-way. El backend de TELAR ya persiste clasificaciones; falta confirmar que el workflow envíe `externalId` y versionar una exportación saneada. No se guarda el cuerpo completo del correo.
- Otros canales no están confirmados.

Ver: [[WhatsApp]] y [[TELAR AI - Estado]].
