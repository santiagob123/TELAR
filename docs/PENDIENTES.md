# Pendientes TELAR

> Actualizado: 2026-10-15. Este es el índice central del trabajo pendiente. El detalle por área vive en las notas enlazadas.

## Cómo leer esta tabla

- **Bloqueado**: no avanzar hasta resolver el bloqueo indicado.
- **Pendiente**: definido, pero sin implementación en curso confirmada.
- **Por definir**: falta información para convertir la retro en tareas concretas.
- Las prioridades reflejan el orden documentado del proyecto; no son fechas de entrega.

## Incidentes y bloqueos

| Prioridad | Pendiente | Estado | Siguiente paso | Referencia |
|---|---|---|---|---|
| P1 | Rate limit para chat público y APIs sensibles | **Migraciones aplicadas en la instancia Supabase configurada; código aún local** | Prisma confirmó el esquema al día tras aplicar las migraciones pendientes. Desplegar el código para activar los cambios en Vercel. | `prisma/schema.prisma`; `prisma/migrations/20260930232316_add_rate_limit_bucket/migration.sql` |
| P0 | Rotar `x-n8n-secret` expuesto en el workflow Gmail y moverlo a credenciales de n8n | Pendiente de configuración externa | Rotar el secreto en n8n y confirmar que el workflow usa credenciales seguras. | [[Seguridad]]; [[Integración Gmail vía n8n]] |
| P1 | WhatsApp Cloud API real | Bloqueado por tercero | Conseguir número de WhatsApp Business y credenciales. | [[WhatsApp]]; [[Canales]] |
| P1 | NFC físico | Bloqueado por tercero | Conseguir permiso o credencial para hardware NFC. | [[NFC]] |

## Tabla priorizada

| Prioridad | Pendiente | Área | Estado | Siguiente paso / nota | Detalle |
|---|---|---|---|---|---|
| P1 | Aplicar y verificar rate limiting | Producción | Migraciones aplicadas en Supabase configurada; código local pendiente de despliegue | Prisma confirma el esquema al día. Repetir/verificar en cualquier entorno adicional y desplegar el código desde `main`. | [[Antes de producción]] |
| P1 | Rotar y asegurar `x-n8n-secret` | Seguridad | Pendiente externo | Rotar en n8n; no se resuelve con un cambio aislado en este repo. | [[Seguridad]] |
| P1 | Login real y sesiones individuales | Auth | **Cuenta demo creada; secreto local y Vercel Production configurados; código local pendiente de despliegue** | La instancia Supabase está al día. Los cambios locales deben llegar a `main` antes de que el login individual funcione en Vercel; tokens globales siguen temporalmente disponibles. | [[Autenticación]] |
| P1 | Asignar negocios históricos sin `ownerId` | Auth / Datos | **Hecho en Supabase configurado** | Mapping revisado y aprobado; los cuatro negocios demo quedaron asignados a `santobernalvega@gmail.com` y verificados por consulta. | [[Base de datos]] |
| P1 | Idempotencia del chat n8n | Integraciones | **Migración aplicada; integración externa parcial** | El endpoint acepta `Idempotency-Key`; el workflow externo aún debe generar/enviar claves estables. | [[Integración Gmail vía n8n]] |
| P1 | Persistir clasificaciones de Gmail en TELAR | Integraciones | **Migración aplicada; integración externa parcial** | El endpoint persiste los campos de clasificación sin guardar el cuerpo del correo. El workflow externo debe enviar `externalId` para deduplicar. | [[Integración Gmail vía n8n]] |
| P1 | Versionar el workflow Gmail en el repo | Integraciones | Pendiente | Incorporar una exportación controlada del workflow. | [[Integración Gmail vía n8n]] |
| P1 | Backups, health checks, alertas y recuperación | Producción | Parcial | Existe `/api/health`; faltan backups, monitoreo externo, alertas y simulacro de recuperación. | [[Antes de producción]] |
| P1 | Añadir `DIRECT_URL` a `.env.example` | Configuración | Hecho | La variable está documentada con un valor de ejemplo sin credenciales reales. | `/.env.example` |
| P1 | Actualizar README | Documentación | Hecho | README describe PostgreSQL, rutas vigentes y setup actual. | `/README.md` |
| P1 | WhatsApp Cloud API real | Integraciones | Bloqueado por tercero | Requiere número y acceso de WhatsApp Business. | [[WhatsApp]] |
| P1 | NFC físico | TAG | Bloqueado por tercero | Requiere permiso o credencial externa. | [[NFC]] |
| P2 | Imagen de perfil | TAG | Parcial | Se puede editar una URL pública y verla en la ficha; carga de archivo espera decisión/proveedor de almacenamiento. | [[Pendientes TAG]] |
| P2 | Borrado de negocio, perfil, TAG y mensajes | Datos | Pendiente | Definir reglas de borrado y dependencias. | [[Base de datos]] |
| P2 | Editar nombre del negocio | TAG | Hecho | El editor de perfiles actualiza el nombre interno del negocio y el título público por separado. | [[Pendientes TAG]] |
| P2 | Timeout explícito en OpenAI | AI | Hecho | Configurable con `OPENAI_TIMEOUT_MS`; valor predeterminado 60000 ms. | [[Providers]] |
| P2 | UI CRUD de Knowledge Base | AI | Parcial | La pantalla administra entradas personalizadas; las entradas base del sistema siguen en solo lectura. La migración de `isEditable` está aplicada en Supabase configurada. | [[Knowledge Base]] |
| P2 | Sincronización de KB que limpie huérfanas | AI | **Código implementado; migración aplicada** | La sincronización elimina duplicados y entradas oficiales obsoletas sin tocar entradas personalizadas. | [[Knowledge Base]] |
| P2 | Evitar mutación implícita en `getAIContext()` | AI | Hecho | `getAIContext()` ahora es de lectura; la preparación/escritura se llama mediante `POST /api/ai/init` y `ensureAIContext()`. | [[Contexto]]; [[APIs]] |
| P2 | Búsqueda semántica en KB | AI | Pendiente | Actualmente la búsqueda es por substring/palabras. | [[Knowledge Base]] |
| P2 | Restaurar el historial visible de ChatBubble | Chat público | Hecho parcialmente | Se restaura en la misma pestaña desde `sessionStorage` (últimos 100 mensajes); no se implementó recuperación entre dispositivos. | [[Historial]]; [[Bugs]] |
| P2 | Paginación de conversaciones y mensajes | Conversaciones | Código e índice aplicados en Supabase configurada | Repetir/verificar la migración `Message_conversationId_createdAt_idx` en cualquier entorno adicional. | [[TELAR AI - Arquitectura]] |
| P2 | Retirar o corregir rutas AI legacy | Limpieza | Hecho con redirecciones | `/admin/ai` y `/admin/conversations` redirigen a `/ai` y `/ai/conversations`. | [[APIs]] |
| P2 | Corregir workflow Gmail | Integraciones | Pendiente externo | Quitar nodos duplicados y configurar `onError`, reintentos, `Idempotency-Key` y `externalId` en n8n. | [[Integración Gmail vía n8n]] |
| P2 | Observabilidad y CI/CD | Producción | Pendiente | Se añadió `/api/health` como readiness; faltan métricas, alertas y despliegues versionados. | [[Antes de producción]] |
| P2 | Método HTTP explícito en handlers AI | AI | Hecho en handlers principales | `init` acepta POST; listado/export aceptan GET; handlers de mensajes y cambios de estado restringen sus métodos. | [[APIs]] |
| P2 | UI de gestión de usuarios | Auth | Pendiente | El alta permanece en CLI; para exponerla hace falta definir quién puede invitar usuarios y administrar accesos. | [[Autenticación]] |
| P2 | Tests E2E reales | QA | Pendiente | Hay pruebas de ownership con Prisma simulado; falta cobertura E2E. | [[Checklist MVP]] |
| P2 | Checklist de documentación obsoleta | Documentación | Parcial | README, seguridad, auth, API y notas centrales sincronizadas; terminar revisión cruzada del Vault por área. | [[TELAR - Inicio]] |
| P2 | 404 HTTP dedicado en SSR TAG | TAG | Hecho | La SSR retorna `notFound` si el identificador no existe. | [[TELAR TAG - Arquitectura]] |
| P2 | Bugs de la retro | QA / UX | **Por definir** | Registrar cada bug cuando recibamos pasos para reproducir y resultado esperado. | [[Bugs]] |
| P2 | Mejoras visuales de la retro | UX | **Por definir** | Acordar pantallas/componentes y criterios visuales a partir de la retro. | [[Pendientes generales]] |
| P3 | Quitar “Modo administración” de ficha pública | TAG | Hecho | Los enlaces administrativos ya no aparecen en la ficha pública. | [[Pendientes TAG]] |
| P3 | Exportar conversaciones a CSV/PDF | Conversaciones | Parcial | JSON y CSV disponibles con filtros; PDF queda pendiente. | [[TELAR AI - Arquitectura]] |
| P3 | Settings reales en Admin y AI | Admin | Pendiente | — | [[Roadmap TELAR]] |
| P3 | Dashboard admin | Admin | Parcial | El token de compatibilidad ya ve métricas y recursos globales; falta decidir si habrá gestión formal de roles/usuarios. | [[Roadmap TELAR]] |

## Próximo orden de trabajo

1. Completar el despliegue del código de autenticación individual para habilitar el acceso de la cuenta demo en producción; los cuatro negocios ya están asignados en Supabase.
2. Desplegar en Vercel los cambios locales de autenticación y rate limiting para que el `SESSION_SECRET` de Production entre en uso.
3. Configurar el workflow n8n con claves idempotentes y `externalId`; rotar el secreto expuesto y versionar el workflow.
4. Preparar backups, monitoreo y recuperación según el proveedor de despliegue.
5. Desbloquear dependencias de terceros (WhatsApp/NFC) cuando estén disponibles.
6. Revisar la retro y confirmar bugs persistentes; dejar el rediseño visual para después de los cambios funcionales.

## Notas relacionadas

- [[TELAR - Inicio]] — navegación general del vault.
- [[AUDIT]] — estado funcional y evidencia del código.
- [[Antes de producción]] — lista operativa de preparación.
- [[Bugs]] — bugs confirmados y por verificar.
- [[Pendientes generales]] y [[Pendientes AI]] — detalle por área.
- [[Roadmap TELAR]] — hitos del producto.
