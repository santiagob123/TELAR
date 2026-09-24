# Pendientes AI

## Funcionalidad

- [ ] Integrar WhatsApp Cloud API real.

## Seguridad

- [ ] Mantener y ampliar tests del security-path.
- [ ] Revisar secretos y credenciales de despliegue.
- [ ] Añadir rate limiting a endpoints públicos y privados.

## UX / mejoras

- [ ] Recuperar historial visual del ChatBubble después de recargar.
- [ ] Mostrar mejor estado cuando Ollama tarda hasta 60 segundos.
- [ ] Manejar timeout visible en frontend.
- [ ] Mejorar entrada para mensajes largos.
- [ ] Mejorar estados de carga, animaciones, microinteracciones, accesibilidad y responsividad del ChatBubble.

## Hardening / producción

- [ ] Añadir observabilidad y health checks.
- [ ] Añadir idempotencia para reintentos n8n.
- [ ] Aplicar ownership/autorización por recurso.
- [ ] Añadir rate limiting y revisar secretos de despliegue.
- [ ] Añadir backups y recuperación.

## Integraciones no confirmadas

- [ ] Confirmar o implementar Gmail real si deja de ser solo prueba.

## QA / Tests

- [ ] Crear tests unitarios para fast-path, security-path, KB, historial y fallback.
- [ ] Crear pruebas de providers lentos, caídos y con respuesta vacía.
