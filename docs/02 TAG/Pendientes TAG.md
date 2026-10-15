# Pendientes TAG

## Funcionalidad

- [ ] Integrar NFC físico/hardware real; actualmente solo existe simulador.

## Seguridad

- [ ] Sustituir administración global por identidad individual.
- [x] Aplicar ownership a perfiles y TAGs.
- [x] Añadir rate limiting al login administrativo (fallback local si el storage persistente falla).
- [x] Limitar la respuesta pública del perfil a campos permitidos.

## UX

- [x] Completar la edición de perfil, incluidos nombre del negocio e imagen mediante URL pública.
- [ ] Añadir carga de archivo de imagen tras elegir proveedor de almacenamiento.
- [ ] Verificar experiencia móvil de QR y páginas públicas.

## QA / Tests

- [ ] Crear tests de aislamiento entre usuarios y negocios.
- [ ] Probar estados active/inactive por API y UI.
- [ ] Probar lectura real de QR.

## Hardening / producción

- [x] Aplicar ownership a perfiles y TAGs.
- [ ] Retirar tokens globales de compatibilidad después de migrar las cuentas.
- [x] Añadir rate limiting y revisar exposición pública de campos.
