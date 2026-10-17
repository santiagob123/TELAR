# Roadmap TELAR

## Entregado localmente

- [x] TAG público, perfil digital, estados y QR.
- [x] ChatBubble público e interno `/ai`, Knowledge Base, historial, fast-path, security-path, providers y fallback.
- [x] Login individual/ownership y token administrativo de compatibilidad configurado en Vercel Production.
- [x] Rate limiting, readiness básico, paginación e idempotencia backend para n8n.
- [x] Exportación JSON/CSV y vista imprimible para guardar conversaciones como PDF desde el navegador.
- [x] Paleta de marca integrada localmente en estilos globales y tokens Tailwind; su publicación forma parte del siguiente despliegue.
- [x] Documentación principal sincronizada con código y despliegue.

## Pendientes que requieren acceso, definición externa o información

- Rotar `x-n8n-secret`, actualizar el workflow para enviar claves de idempotencia/`externalId` y entregar una exportación saneada para versionado. Requiere acceso a n8n.
- Validar login individual y aislamiento en Production con credenciales de propietario; retirar tokens globales solo tras esa comprobación.
- Definir monitoreo, alertas, backups y recuperación con Vercel/Supabase y el responsable operativo.
- Activar WhatsApp Cloud API cuando existan cuenta/número y credenciales de Meta.
- Integrar NFC físico cuando se disponga de hardware y autorización.
- Definir proveedor de almacenamiento para carga de imágenes y política de borrado/retención de datos.
- Definir proveedor/costo para búsqueda semántica y alcance de Settings; el listado/alta básica de propietarios está implementado localmente.
- Recibir pasos reproducibles y criterios visuales de la retro para registrar y corregir sus bugs.

## Verificación

Las pruebas de aislamiento existentes usan Prisma simulado. La verificación del token global y endpoints en Vercel no equivale a una prueba E2E ni a validar una sesión de propietario. Las migraciones deben verificarse en cualquier entorno Supabase adicional.

No se asignan fechas porque no están definidas en el proyecto.
