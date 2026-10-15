# TELAR

> Mapa de navegación del proyecto y acceso rápido al estado de trabajo.

## Estado general

El proyecto reúne TELAR TAG (perfiles públicos y QR) y TELAR AI (asistente y conversaciones). El estado de funcionalidades, limitaciones y preparación para producción se mantiene en las notas enlazadas; confirmar siempre contra el código antes de tomar decisiones de implementación.

## Panel de trabajo

- **Backlog priorizado:** [[PENDIENTES]]
- **Auditoría funcional y evidencia:** [[AUDIT]]
- **Bugs y retro:** [[Bugs]]
- **Roadmap:** [[Roadmap TELAR]]
- **Preparación para producción:** [[Antes de producción]]

### En foco

- [ ] Recibir el detalle de los bugs de la retro (pasos para reproducir y resultado esperado).
- [ ] Recibir las pantallas o componentes cuya presentación visual se debe mejorar.
- [ ] Resolver el drift del índice `Business_ownerId_idx` antes de continuar con rate limiting.
- [ ] Rotar el secreto de n8n expuesto en configuración externa.

## Mapa del vault

### Producto

- [[MVP - TELAR TAG]] · [[MVP - TELAR AI]] · [[Estado actual del MVP]]

### TELAR TAG

- [[TELAR TAG - Estado]] · [[TELAR TAG - Arquitectura]]
- [[QR]] · [[NFC]] · [[Seguridad TAG]] · [[Pendientes TAG]]

### TELAR AI

- [[TELAR AI - Estado]] · [[TELAR AI - Arquitectura]]
- [[Knowledge Base]] · [[Contexto]] · [[Historial]]
- [[Fast Path]] · [[Security Path]] · [[Providers]] · [[Canales]] · [[WhatsApp]]
- [[Pendientes AI]] · [[Handoff humano]] · [[Integración Gmail vía n8n]]

### Arquitectura y calidad

- [[Arquitectura general]] · [[Base de datos]] · [[APIs]]
- [[Autenticación]] · [[Seguridad]]
- [[Checklist MVP]] · [[Pruebas AI]] · [[Pruebas de seguridad]] · [[Pruebas TAG]]

### Decisiones y planificación

- [[Decisiones técnicas]] · [[Roadmap TELAR]]
