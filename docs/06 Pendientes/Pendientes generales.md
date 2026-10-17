# Pendientes generales

El trabajo que puede completarse directamente en el repositorio se refleja como implementado en [[PENDIENTES]] y [[AUDIT]]. Esta nota conserva dependencias operativas y externas.

## Integraciones/credenciales externas

- Actualizar/versionar el workflow Gmail n8n con secreto rotado, `Idempotency-Key`, `externalId`, reintentos y manejo de errores.
- Integrar WhatsApp Cloud API cuando haya cuenta/número de negocio y credenciales.
- Integrar NFC físico cuando haya lector y autorización.

## Producción y cuentas

- Validar login individual y aislamiento por propietario en Vercel con credenciales propietarias; retirar tokens legacy después.
- Configurar monitoreo, alertas, backups y recuperación con acceso a Vercel/Supabase.
- Verificar migraciones y rate limits en entornos adicionales antes de habilitarlos.

## Decisiones e información que faltan

- Definir servicio de almacenamiento para carga de imágenes y política de retención/borrado de datos.
- Definir proveedor/costo de búsqueda semántica y opciones editables de Settings; el listado/alta básica de propietarios ya está implementado localmente.
- Incorporar bugs y mejoras de retro al recibir sus pasos de reproducción, resultado esperado y referencias visuales.

## Calidad

La suite de ownership actual usa Prisma simulado. La cobertura E2E/runtime con cuentas y datos aislados debe realizarse cuando haya un entorno de prueba/credenciales apropiadas; la validación de Vercel reportada en [[AUDIT]] solo cubrió el token administrativo global.
