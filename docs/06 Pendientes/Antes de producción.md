# Antes de producción

## Implementación confirmada

- [x] Aplicar las ocho migraciones en la instancia Supabase configurada.
- [x] Implementar ownership y autorización por recurso en APIs privadas.
- [x] Provisionar cuenta demo, configurar `SESSION_SECRET` y desplegar login individual.
- [x] Revisar/aprobar y asignar cuatro negocios históricos a la cuenta demo en la instancia Supabase configurada.
- [x] Implementar rate limiting y desplegar código; existe `/api/health`.
- [x] Soportar idempotencia de chat y persistencia de clasificaciones en backend.
- [x] Confirmar deployment Production Ready `8c5c678`; verificar login del token de compatibilidad y APIs administrativas.

## Hardening local — 2026-10-16

- [x] Actualizar dependencias de producción; `npm audit --omit=dev` reporta cero vulnerabilidades.
- [x] Migrar Tailwind CSS 4 y PostCSS; `npm audit` completo reporta cero vulnerabilidades y el inicio se revisó en navegador local.
- [x] Añadir validación de origen para mutaciones autenticadas, expiración de ocho horas a cookies legacy, límite de login fail-closed en producción y cabeceras de seguridad.
- [x] Ejecutar build y smoke local de cabeceras, respuestas no autenticadas, CSRF y expiración de cookies.
- [ ] Desplegar estos cambios; el código aún no está en Production.
- [ ] Completar las verificaciones runtime de CSRF, expiración, rate limiting y aislamiento descritas en [[Pruebas de seguridad]].

## Dependencias externas pendientes

- Rotar el valor de `N8N_WEBHOOK_SECRET` (enviado como `x-n8n-secret`) tanto en Vercel Production como en n8n, y comprobar que el secreto anterior ya no funciona.
- Configurar workflow n8n para `Idempotency-Key`/`externalId`, reintentos y manejo de errores; versionar exportación saneada.
- Validar login individual/islamiento usando credenciales del propietario en Production antes de retirar tokens globales.
- Configurar monitoreo, alertas, backups y recuperación con los responsables/proveedores de Vercel y Supabase.
- Verificar migraciones y límites en cualquier ambiente adicional antes de usarlo.
- Confirmar provider/credenciales de producción y coordinar una verificación controlada de timeouts.
- Obtener cuenta/número WhatsApp Business y hardware/permisos NFC si se van a habilitar esas funciones.
- Recibir los casos concretos de retro y criterios de revisión visual.

Las pruebas actuales de ownership usan Prisma simulado; la respuesta 200 de APIs en Production no representa cobertura E2E ni prueba de acceso por usuario propietario.
