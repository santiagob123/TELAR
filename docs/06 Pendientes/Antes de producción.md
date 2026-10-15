# Antes de producción

- [x] Aplicar y verificar las 8 migraciones en la instancia Supabase configurada; verificar también cualquier entorno adicional.
- [ ] Rotar cualquier secreto expuesto durante desarrollo.
- [x] Implementar ownership y autorización por recurso para APIs privadas.
- [x] Provisionar una cuenta de demostración; desplegar el código de login sigue pendiente.
- [x] Revisar, aprobar y aplicar el mapping de cuatro negocios históricos a la cuenta de demostración en Supabase.
- [ ] Añadir pruebas E2E críticas. No se añadieron ni ejecutaron pruebas en esta iteración.
- [ ] Configurar logs, métricas y alertas; existe un health check básico en `/api/health`.
- [ ] Definir backups y recuperación.
- [x] Implementación de rate limiting y migraciones aplicadas en la instancia Supabase configurada; falta desplegar el código y revisar cada entorno adicional.
- [ ] Confirmar provider de producción y timeouts.
- [ ] Decidir estado de WhatsApp y n8n.
- [ ] Revisar accesibilidad y UX móvil.


## Migraciones de cambios recientes

Las migraciones de rate limiting, clasificaciones, idempotencia n8n, Knowledge Base editable y paginación están aplicadas y verificadas en la instancia Supabase configurada. Repite la comprobación en cada entorno adicional antes de habilitar allí estas funciones.
