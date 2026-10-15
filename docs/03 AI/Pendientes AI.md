# Pendientes AI

## Funcionalidad

- [ ] Integrar WhatsApp Cloud API real.

## Seguridad

- [ ] Mantener y ampliar tests del security-path.
- [ ] Revisar secretos y credenciales de despliegue.
- [x] Añadir rate limiting a endpoints públicos y privados; migraciones aplicadas en Supabase configurada, falta desplegar el código actualizado en Vercel.

## UX / mejoras

- [x] Recuperar historial visual del ChatBubble después de recargar en la misma pestaña.
- [x] Mostrar mejor estado cuando el proveedor tarda.
- [x] Manejar timeout visible en frontend.
- [x] Limitar y manejar entradas largas.
- [x] Mejorar estados de carga, feedback accesible y responsividad básica del ChatBubble.

## Hardening / producción

- [x] Añadir health check básico; observabilidad y alertas siguen pendientes.
- [x] Añadir soporte de idempotencia para reintentos n8n; falta configurar el workflow externo.
- [x] Aplicar ownership/autorización por recurso en el contexto, conversaciones y exportación privadas.
- [ ] Asignar contextos históricos sin `ownerId` mediante una operación controlada.
- [x] Añadir rate limiting y configurar `SESSION_SECRET` local y en Vercel Production; desplegar el código actualizado sigue pendiente.
- [ ] Añadir backups y recuperación.

## Integraciones no confirmadas

- [x] Persistir en TELAR las clasificaciones del workflow Gmail vía n8n (canal externo activo, one-way); falta versionar la exportación del workflow.

## QA / Tests

- [ ] Crear tests unitarios para fast-path, security-path, KB, historial y fallback.
- [ ] Crear pruebas de providers lentos, caídos y con respuesta vacía.
