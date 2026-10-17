# Auditoría funcional

> Actualizado: 2026-10-16. La auditoría distingue código en `main`, cambios locales, verificación de endpoints en Production y dependencias externas. No implica que cada flujo de usuario tenga cobertura E2E.

| Área | Funcionalidad | Estado | Evidencia / comprobación | Pendiente |
|---|---|---|---|---|
| TAG | Páginas públicas, estados active/inactive y 404 SSR | COMPLETA | `lib/public-tag.ts`; `pages/tag/[id].tsx`; revisión visual a 390 px y URL del QR demo123 | Escanear etiqueta QR física con un teléfono real. |
| TAG | Perfil y APIs privadas con ownership | IMPLEMENTADA | `pages/api/profiles/*`; `pages/api/tags/*`; `lib/admin-auth.ts` | Validar aislamiento con una sesión individual en Production. |
| TAG | Lectura NFC física | PENDIENTE | Solo está disponible el simulador | Bloqueado por hardware/permisos externos. |
| Auth | Sesión individual por correo/contraseña y alcance global del admin configurado | DESPLEGADA | `lib/user-session.ts`; `lib/admin-auth.ts`; `lib/ai-auth.ts`; commit Production `8c5c678` | Verificar login individual de admin y propietario en Production. |
| Admin | Listado/alta de cuentas propietarias, roles derivados y negocios asignados | IMPLEMENTADO LOCALMENTE | `pages/admin/users.tsx`; `pages/api/admin/users.ts`; `ADMIN_USER_ID` distingue admin de propietario | Desplegar; la reasignación y recuperación de cuentas no están incluidas. |
| Auth | Identidad global de compatibilidad | VERIFICADA | `ADMIN_USER_ID` configurado en Vercel Production para `admin@example.com`; login por token 204 y APIs admin 200 | Retirar tokens globales solo después de validar propietarios y migración completa. |
| Seguridad | Hardening de sesión, CSRF, secretos, rate limiting y cabeceras | IMPLEMENTADO LOCALMENTE; PENDIENTE DE DESPLIEGUE | `lib/request-security.ts`; `lib/secure-compare.ts`; Next 15.5.28; Tailwind 4.3.3; `npm audit` y `npm run build` pasan; smoke local aprobado | Desplegar y completar pruebas runtime con dos cuentas; rotar `N8N_WEBHOOK_SECRET` en Vercel y n8n. |
| Datos | Asignación de cuatro negocios históricos | COMPLETA EN SUPABASE CONFIGURADA | Mapping aprobado y backfill aplicado | Verificar por separado otros entornos. |
| TELAR AI | Conversaciones, handoff humano y paginación | IMPLEMENTADA / ENDPOINTS VERIFICADOS | `/api/ai/conversations` devolvió 200; `lib/ai-conversations.ts`; páginas de conversaciones | Pruebas E2E y revisión del comportamiento móvil. |
| TELAR AI | Knowledge Base personalizada y sincronización | IMPLEMENTADA / ENDPOINT VERIFICADO | `/api/ai/knowledge` devolvió 200 y 14 entradas; `services/ai/knowledge.ts` | Búsqueda semántica pendiente de decisión técnica. |
| Chat público | Historial visible y persistido | IMPLEMENTADO EN LA MISMA PESTAÑA | `components/usePublicChat.ts` guarda/restaura hasta 100 mensajes en `sessionStorage`; DB persiste conversaciones | No existe restauración entre dispositivos. |
| AI | Providers, fallback y timeout explícito | IMPLEMENTADA | `services/ai/provider.ts`; `services/ai/index.ts` | Probar provider lento/caído/vacío en pruebas automatizadas. |
| Integraciones | Clasificación de Gmail persistida en TELAR | IMPLEMENTADA EN BACKEND | `pages/api/integrations/n8n/classify.ts`; persistencia por `externalId`; usa el contexto del admin configurado | Falta cambiar/verificar el workflow externo y versionar su exportación saneada. |
| Integraciones | Idempotencia del chat n8n | IMPLEMENTADA EN BACKEND | `pages/api/integrations/n8n/chat.ts` acepta `Idempotency-Key` y resuelve el contexto del admin configurado | El workflow debe enviar claves estables. |
| Integraciones | Secreto de n8n | RIESGO ABIERTO | Secreto reportado como expuesto en workflow externo | Rotarlo en n8n y pasarlo a credenciales seguras. |
| Producción | Rate limiting y readiness | IMPLEMENTADO; VERIFICACIÓN PARCIAL | `lib/rate-limit.ts`; `pages/api/health.ts`; migraciones aplicadas en la instancia Supabase configurada | Verificar límites en Production y esquema en cada entorno adicional; falta monitor externo/alertas. |
| Producción | Backups y recuperación | PENDIENTE | No hay evidencia de política/simulacro en el repo | Definir responsable, retención, alertas y hacer simulacro. |
| Exportación | Conversaciones JSON, CSV e impresión PDF | IMPLEMENTADA EN UI | Endpoints JSON/CSV y botón `Imprimir / Guardar PDF` en `pages/ai/conversations.tsx` | PDF se crea desde el diálogo del navegador; no hay generación PDF en servidor. |
| QA | Pruebas de aislamiento | PARCIAL (14/14 pruebas locales pasan) | `tests/ownership.test.cjs` valida sesiones individuales y ownership con Prisma simulado | Añadir pruebas E2E e integración con una BD de prueba aislada. |
| UX / diseño | Paleta de marca | LOCAL SIN DESPLEGAR | Cambios locales en `styles/globals.css` y `tailwind.config.js` | Revisar visualmente y publicar tras completar cambios funcionales. |
| UX / retro | Bugs específicos | POR CLASIFICAR | `docs/06 Pendientes/Bugs.md` | Aún se necesitan casos reproducibles y resultado esperado. |

## Despliegue comprobado

- Vercel Production sirve el commit `8c5c678` (`fix: grant configured admin global session access`).
- El commit `8c5c678` (`fix: grant configured admin global session access`) está Ready en Vercel Production y asignado al alias `telar-kappa.vercel.app`.
- Prueba autenticada con el token de compatibilidad: `POST /api/admin/login` respondió 204; `/api/profiles`, `/api/admin/dashboard`, `/api/ai/conversations` y `/api/ai/knowledge` respondieron 200.
- El dashboard reportó seis negocios, cinco perfiles, cinco TAGs, 228 conversaciones y cero conversaciones en handoff humano en esa comprobación. La primera página de conversaciones contenía 20 elementos y más páginas disponibles.
- Tras el deployment, `/api/admin/dashboard` volvió a responder con seis negocios, cinco perfiles, cinco TAG activos y 228 conversaciones. La sesión del navegador no se pudo identificar como login individual o token de compatibilidad.
- El comportamiento nuevo está desplegado, pero aún falta iniciar sesión individualmente con admin y propietario para validar alcance global y aislamiento antes de retirar tokens legacy.

## Bloqueos externos y deuda

- WhatsApp Cloud API: falta número/cuenta de WhatsApp Business y credenciales.
- NFC físico: falta hardware y autorización.
- n8n: rotar secreto expuesto, actualizar el workflow con `Idempotency-Key` y `externalId`, y versionar una exportación sin secretos.
- Producción: faltan monitoreo externo, alertas, política de backups y simulacro de recuperación.
- Seguridad: mantener el token de compatibilidad solo durante la transición; retirarlo tras validar login individual y aislamiento por propietario.
