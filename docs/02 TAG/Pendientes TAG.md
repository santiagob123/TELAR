# Pendientes TAG

El código de perfiles, TAG, QR, validación y ownership por negocio está implementado. Las verificaciones manuales de UI/QR y sesiones de propietario requieren acceso a cuentas/dispositivos de prueba; no están certificadas como E2E.

## Dependencias externas

- Integración NFC real: requiere hardware y autorización.
- Carga de imágenes: requiere decidir/provisionar almacenamiento.
- Borrado de datos: requiere política de retención/cascadas aprobada.
- Login de propietario en Production: validar con sus credenciales antes de retirar el token global.
- Migraciones/ownership: repetir comprobación en cada ambiente adicional antes de habilitarlo.
- Revisión móvil y QR real: completar en los dispositivos y tamaños objetivo cuando estén disponibles.
- Retro visual: registrar correcciones cuando se reciban capturas/criterios concretos.
