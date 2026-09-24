# Estado actual del MVP

## Resumen

🟢 Núcleo TAG + AI implementado; pendientes funcionales: NFC físico y WhatsApp real.

### Confirmado

- Aplicación Next.js con Pages Router.
- Prisma configurado en el schema para PostgreSQL y migración de `Business.ownerId` aplicada en la base de desarrollo.
- TAG público y panel administrativo protegido por token.
- AI público e interno con provider configurable.
- QR generado en frontend.
- Seed para datos demo y Knowledge Base.

### Parcial

- Ownership: relación opcional `User -> Business` declarada, pero no aplicada a APIs ni confirmada en runtime.
- Persistencia de conversaciones: `Conversation` y `Message` se guardan en backend y está validado.
- El ChatBubble todavía no recupera visualmente el historial tras recargar; es una mejora UX, no un fallo de persistencia.
- Seguridad administrativa: existe token global, no identidad multiusuario.

### Funcionalidad pendiente

- NFC físico/hardware real.
- Integración real de WhatsApp Cloud API.

### UX

- Recuperación visual del historial tras recargar.
- Mejor feedback para providers lentos y mensajes largos.

### Hardening, producción y QA

- Ownership y autorización por recurso.
- Tests automatizados, rate limiting, idempotencia n8n, observabilidad, backups y health checks.

Ver: [[Pendientes generales]] y [[Roadmap TELAR]].
