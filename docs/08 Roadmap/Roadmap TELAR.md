# Roadmap TELAR

## MVP actual

- [x] TAG público, perfil digital, estados y QR.
- [x] ChatBubble AI público e interno `/ai`; `/chat` retirado como UI y redirige a `/`.
- [x] KB, contexto, historial, fast-path y security-path.
- [x] Providers configurables y fallback.
- [x] Exportación JSON de conversaciones con filtros por fecha en `America/Bogota`.
- [x] Relación opcional `User -> Business` declarada en Prisma.
- [x] Ownership aplicado a APIs privadas TAG y AI mediante principales configurados.

## Funcionalidad pendiente

- [ ] NFC físico/hardware real.
- [ ] Integración real de WhatsApp Cloud API.

## UX / mejoras

- [ ] Completar recuperación de historial del ChatBubble.
- [ ] Mejorar estados de carga, mensajes largos, accesibilidad, responsividad y microinteracciones.

## Hardening / producción / QA

- [ ] Sustituir los principales globales por identidad individual y sesiones multiusuario.
- [ ] Asignar negocios históricos sin propietario con una operación controlada.
- [ ] Rate limiting.
- [ ] Observabilidad, health checks y alertas.
- [ ] Gestión/rotación de secretos.
- [ ] Revisión de errores expuestos.
- [ ] Pruebas de provider lento o no disponible.
- [ ] Backups y recuperación.
- [ ] Idempotencia para reintentos n8n.
- [ ] Tests automatizados críticos.

## Integraciones no confirmadas

- [ ] Persistir en TELAR las clasificaciones del workflow Gmail vía n8n y versionarlo en el repo (canal activo, one-way).

No se asignan fechas porque no están definidas en el proyecto.
