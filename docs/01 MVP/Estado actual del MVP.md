# Estado actual del MVP

> Actualizado: 2026-10-15. Contrastar estado de base de datos con cada ambiente antes de operar migraciones.

## Resumen

🟢 Núcleo TAG + AI implementado y desplegado. Permanecen dependencias externas (WhatsApp/NFC), validación E2E/operativa y trabajo de producción.

### Confirmado

- Aplicación Next.js Pages Router con Prisma configurado para PostgreSQL.
- TAG público, perfil digital, QR, estados active/inactive y panel de propietario.
- Login individual por correo/contraseña, sesión segura y ownership implementados en `main` y desplegados en Vercel Production.
- El token de compatibilidad sigue habilitado como acceso global temporal y está vinculado a `ADMIN_USER_ID`.
- AI pública e interna con Knowledge Base, historial persistido, providers configurables, fallback, límites y paginación.
- Exportación de conversaciones JSON y CSV.
- Cuenta demo y asignación de cuatro negocios aprobadas y aplicadas en la instancia Supabase configurada.
- Health check básico en `/api/health`.

### Parcial / por validar

- Se verificó el token administrativo global y sus APIs principales en Vercel; falta validar login individual y aislamiento real con el usuario propietario.
- Las pruebas actuales de ownership usan Prisma simulado; faltan flujos E2E/integración.
- El ChatBubble restaura hasta 100 mensajes en la misma pestaña; no hay sincronización entre dispositivos.
- El backend persiste clasificaciones Gmail e implementa idempotencia; el workflow externo debe enviar `externalId` y `Idempotency-Key` estables.
- La paleta de marca está preparada en cambios locales y aún no está desplegada.

### Funcionalidad pendiente/bloqueada

- NFC físico/hardware real y WhatsApp Cloud API real requieren recursos/credenciales de terceros.
- Búsqueda semántica KB, exportación PDF, carga de archivos de imagen, borrado de datos y gestión de roles/settings requieren decisiones de diseño/operación.
- Faltan monitoreo externo, alertas, backups y simulacro de recuperación.

Ver: [[Pendientes generales]], [[Pendientes TAG]], [[Pendientes AI]] y [[Roadmap TELAR]].
