# Roadmap TELAR

## MVP actual

- [x] TAG público, perfil digital, estados y QR.
- [x] ChatBubble AI público e interno `/ai`; `/chat` retirado como UI y redirige a `/`.
- [x] KB, contexto, historial, fast-path y security-path.
- [x] Providers configurables y fallback.
- [x] Exportación JSON de conversaciones con filtros por fecha en `America/Bogota`.
- [x] Relación opcional `User -> Business` declarada en Prisma.

## Funcionalidad pendiente

- [ ] NFC físico/hardware real.
- [ ] Integración real de WhatsApp Cloud API.

## UX / mejoras

- [ ] Completar recuperación de historial del ChatBubble.
- [ ] Mejorar estados de carga, mensajes largos, accesibilidad, responsividad y microinteracciones.

## Hardening / producción / QA

- [ ] Diseñar identidad individual y sesión.
- [ ] Aplicar ownership y autorización por recurso a APIs TAG.
- [ ] Rate limiting.
- [ ] Observabilidad, health checks y alertas.
- [ ] Gestión/rotación de secretos.
- [ ] Revisión de errores expuestos.
- [ ] Pruebas de provider lento o no disponible.
- [ ] Backups y recuperación.
- [ ] Idempotencia para reintentos n8n.
- [ ] Tests automatizados críticos.

## Integraciones no confirmadas

- [ ] Confirmar integración Gmail real.

No se asignan fechas porque no están definidas en el proyecto.
