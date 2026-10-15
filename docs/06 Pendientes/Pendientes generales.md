# Pendientes generales

## Funcionalidad

- [ ] Integrar NFC físico/hardware real.
- [ ] Integrar WhatsApp Cloud API real.

## UX / mejoras

- [x] Recuperar historial visual del ChatBubble tras recarga en la misma pestaña.
- [x] Mejorar feedback de provider lento.
- [x] Limitar y manejar mensajes largos.
- [x] Mejorar estados de carga, accesibilidad básica y responsividad del chat.

## Hardening / producción

- [x] Aplicar ownership y autorización por recurso en APIs privadas TAG y AI.
- [ ] Provisionar usuarios y configurar los principales `ADMIN_USER_ID`/`AI_USER_ID`.
- [x] Asignar los cuatro negocios históricos aprobados a la cuenta de demostración en Supabase.
- [ ] Sustituir o limitar tokens globales.
- [x] Añadir rate limiting; migraciones aplicadas en Supabase configurada, falta desplegar el código y verificar otros entornos.
- [ ] Añadir observabilidad, alertas, backups y simulacro de recuperación.
- [x] Añadir health check básico; falta monitoreo externo.
- [x] Añadir soporte de idempotencia para n8n; falta enviar la clave desde el workflow.

## QA / Tests

- [ ] Añadir tests automatizados.
- [ ] Cubrir APIs críticas y aislamiento de ownership.

## Documentación

- [ ] Mantener este Vault sincronizado con cambios reales.
- [ ] Persistir en TELAR las clasificaciones del workflow Gmail externo y versionarlo en el repo (canal activo, one-way).
