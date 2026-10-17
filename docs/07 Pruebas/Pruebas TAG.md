# Pruebas TAG

## Confirmado en implementación

- Validación de identificadores y estados `active`/`inactive`.
- Creación transaccional de Business/Profile/Tag.
- Página pública por TAG y proyección de datos permitidos.
- Generación de QR en frontend.
- Ownership aplicado a recursos privados.

## Verificación manual/runtime

El aislamiento de ownership tiene pruebas con Prisma simulado en `tests/ownership.test.cjs`; no son E2E. La validación de UI y QR con dispositivos reales requiere cuentas de prueba, deployment/datos aislados y dispositivo móvil. Revisar esos escenarios cuando el entorno y dispositivos estén disponibles. La lectura NFC física se detalla en [[NFC]] y requiere hardware/permisos.
