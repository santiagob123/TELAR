# Pendientes AI

El código de AI incluye contexto/KB, conversación, handoff, paginación, exportación JSON/CSV, impresión PDF desde navegador, ownership y rate limiting. La verificación de producción del token global está documentada en [[AUDIT]].

## Dependencias externas y decisiones

- WhatsApp Cloud API real: requiere cuenta/número y credenciales de WhatsApp Business.
- Gmail/n8n: rotar secreto, actualizar workflow para `Idempotency-Key` y `externalId`, añadir manejo de reintentos/errores y versionar exportación saneada.
- Login AI individual: validar sesión y aislamiento de propietario en Production antes de retirar token legacy.
- Operación Production: definir proveedor activo/timeouts, configurar monitoreo/alertas/backups/recuperación y comprobar cada entorno.
- Búsqueda semántica: definir proveedor, almacenamiento vectorial, costo y fallback.
- QA E2E: ejecutar en un entorno aislado con credenciales/configuración de providers controladas; las pruebas actuales usan Prisma simulado.
- Retro/UX: recibir casos de provider lento/caído y mejoras visuales concretas.
