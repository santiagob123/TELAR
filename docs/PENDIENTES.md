# Pendientes TELAR

> Actualizado: 2026-10-16. Se contrastó el estado con `main`, los cambios locales y el despliegue de Vercel verificado.

Los cambios locales de seguridad implementables están realizados y pasan build, audit completo y smoke local. Falta rotar una credencial externa, desplegar el código y validar el comportamiento en Production con dos cuentas.

## Estado ya completado

| Área | Trabajo completado | Evidencia |
|---|---|---|
| Auth / Producción | Configurar `ADMIN_USER_ID` para `admin@example.com`; desplegar la sesión admin con alcance global | Deployment `8c5c678` en Vercel Production está Ready; el dashboard respondió con 6 negocios, 5 perfiles, 5 TAG activos y 228 conversaciones en una sesión ya autenticada. |
| Documentación | Sincronizar tabla de pendientes, auditoría, estado MVP, notas de Auth/TAG/AI, historial, pruebas y roadmap | Notas Markdown del vault actualizadas el 2026-10-15. |
| Conversaciones | Añadir vista imprimible para guardar la exportación filtrada como PDF desde el navegador | `pages/ai/conversations.tsx`; requiere que el usuario elija “Guardar como PDF” en impresión. |
| Chat público | Confirmar restauración de los últimos 100 mensajes en la misma pestaña | `components/usePublicChat.ts`; no sincroniza entre dispositivos. |
| Código | Corregir los estados obsoletos de login, ownership, rate limiting, migraciones, KB e integración Gmail (backend); seleccionar el contexto AI global para webhooks n8n | `pages/api/integrations/n8n/*` resuelve el contexto del admin configurado; build y 14/14 pruebas de ownership locales pasan. El workflow externo sigue pendiente por separado. |
| Auth / Admin | Aplicar acceso global también a la sesión por correo del usuario configurado en `ADMIN_USER_ID` | Commit `8c5c678`, desplegado en Production; propietarios siguen filtrados por su ID. |
| Seguridad | Actualizar dependencias y cerrar comparación de secretos, CSRF, expiración de cookies, rate limiting fail-closed y cabeceras | Next.js 15.5.28, nanoid 3.3.20 y Tailwind 4.3.3; `npm audit` completo y `npm run build` pasan. Smoke local de cabeceras/CSRF/sesiones aprobado. Aún no desplegado ni validado en Production. |
| Admin / Usuarios | Añadir consulta de usuarios, roles derivados y alta de cuentas propietarias desde el panel | `pages/admin/users.tsx`, `pages/api/admin/users.ts` y navegación; cambio local, pendiente de despliegue. |
| QA / móvil y QR | Revisar ficha pública y lista de perfiles a 390 px; abrir QR de `demo123` | En móvil, la ficha y tarjetas se ajustan al ancho; el QR muestra `https://telar-kappa.vercel.app/tag/demo123`, que coincide con el perfil público. |

## Pendientes externos o bloqueados

| Prioridad | Área | Pendiente | Estado / dependencia | Próximo paso cuando esté disponible |
|---|---|---|---|---|
| P0 | Seguridad / n8n | Rotar `N8N_WEBHOOK_SECRET` en Vercel y sincronizarlo con el workflow n8n | **Pendiente externo**: el operador debe introducir el mismo valor nuevo en ambos servicios y redeployar | Pausar el workflow, rotar en Vercel Production y n8n, redeployar y comprobar que el secreto anterior falla y el nuevo funciona. |
| P1 | n8n / Integraciones | Configurar el workflow Gmail para enviar `Idempotency-Key` y `externalId` estables | **Pendiente externo**: workflow vive en n8n | Actualizar nodos, reintentos y errores; comprobar deduplicación. |
| P1 | n8n / Integraciones | Versionar una exportación saneada del workflow Gmail | **Pendiente externo**: hace falta exportación actual; no incluir secretos ni datos privados | Revisar y guardar la exportación en el repo. |
| P1 | Producción | Monitoreo, alertas, backups y simulacro de recuperación | **Pendiente externo/operativo**: configurar Vercel/Supabase y responsable | Definir retención/alertas, configurar supervisión y probar restauración. |
| P1 | QA / Seguridad / Production | Validar CSRF, caducidad de cookies legacy, límite de login y alcance de admin/propietarios | **Pendiente de despliegue y prueba runtime** con dos cuentas; las 14 pruebas locales de ownership pasan con Prisma simulado. | Probar origen permitido/no permitido con sesión real, rate limiting persistente y que admin vea todos los negocios mientras cada propietario solo ve los suyos. Retirar tokens globales solo después. |
| P1 | WhatsApp | Integrar WhatsApp Cloud API real | **Bloqueado por tercero**: número/cuenta WhatsApp Business y credenciales | Continuar cuando se habilite el acceso. |
| P1 | TAG / NFC | Integrar lectura NFC física | **Bloqueado por tercero**: hardware y permisos | Continuar cuando se disponga del lector y autorización. |
| P2 | AI / Knowledge Base | Búsqueda semántica | **Pendiente de decisión externa** sobre proveedor, costo y almacenamiento vectorial | Definir arquitectura y límites antes de elegir proveedor. |
| P2 | TAG / Perfil | Carga de imágenes desde archivo | **Pendiente de proveedor externo** de almacenamiento | Elegir servicio, límites, tipos de archivo y política de acceso. |
| P2 | Datos | Borrado de negocios, perfiles, TAGs y mensajes | **Pendiente de política/decisión de producto** sobre retención y cascadas | Aprobar reglas de borrado antes de exponer una operación destructiva. |
| P2 | Admin / AI | Settings configurables y gestión avanzada de cuentas | **Pendiente de alcance**: falta definir reasignación de negocios, recuperación de contraseña y opciones editables. El alta/listado básico de propietarios está implementado localmente. | Definir cambios permitidos para cuentas existentes y qué ajustes se administran desde la interfaz. |
| P2 | QA / dispositivos | Escanear el QR físico con la cámara de un teléfono | **Pendiente de dispositivo físico**; la vista móvil y URL del QR se revisaron en navegador a 390 px. | Escanear la etiqueta física y confirmar apertura del perfil en un teléfono real. |
| P2 | Retro | Corregir bugs y aplicar mejoras visuales específicas | **Pendiente de información**: aún no recibimos pasos, resultados esperados ni pantallas | Registrar cada caso reproducible al recibir la retro. |

## Notas

- La paleta de marca está aplicada en `styles/globals.css` y `tailwind.config.js` en el árbol local; no forma parte del commit/deployment `8c5c678`.
- El commit `8c5c678` incluye solo `lib/admin-auth.ts` y `lib/ai-auth.ts`. La documentación, gestión local de usuarios, cambios de seguridad, estilos y conversaciones aún no están desplegados.
- `npm audit` completo está limpio y la migración de Tailwind conserva el diseño local revisado en navegador.
- Las verificaciones de migraciones corresponden a la instancia Supabase configurada; repetirlas solo si se habilitan otros entornos.

## Referencias

- [[AUDIT]] — evidencia funcional y estado de despliegue.
- [[Antes de producción]] — lista de dependencias operativas.
- [[Bugs]] — registro de casos de retro.
- [[Pendientes generales]], [[Pendientes TAG]], [[Pendientes AI]] y [[Roadmap TELAR]].
