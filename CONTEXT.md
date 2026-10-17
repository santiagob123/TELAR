# Contexto técnico de TELAR

El snapshot inicial de las secciones 1–12 fue generado por inspección estática el 2026-09-26 y es histórico. Para el estado actual de código y despliegue, prevalece la sección **Estado vigente de implementación — 2026-10-15**, contrastada con `main`, Vercel Production y las comprobaciones descritas allí.

## 1. Resumen ejecutivo

TELAR es una aplicación web monolítica Next.js con Pages Router que reúne dos áreas: TELAR TAG, para negocios, perfiles digitales, identificadores públicos y QR; y TELAR AI, para chat público e interno, Knowledge Base, conversaciones y proveedores de IA. Usa Prisma con PostgreSQL en el schema y migraciones activas. La autorización de recursos privados filtra por `Business.ownerId`, pero los principales se configuran mediante tokens globales y un único `ADMIN_USER_ID`/`AI_USER_ID` por área; no existe autenticación individual multiusuario. El núcleo demo TAG/AI está conectado de UI a persistencia; el handoff humano está implementado end-to-end, mientras que NFC físico y WhatsApp real siguen bloqueados por terceros, y la recuperación visual del historial público y el hardening de producción siguen pendientes. Existe una suite de catorce pruebas de ownership y handoff con fixtures y Prisma simulado; no se detectó una suite E2E (`services/ai/conversation.ts:66,67`; `pages/api/ai/conversations/[id]/messages.ts:49`; `pages/ai/conversations.tsx:112,141`; `tests/ownership.test.cjs:414,449,464,494,528`).

## 2. Stack y dependencias

| Componente | Declarado | Resuelto en `package-lock.json` |
|---|---|---|
| Node.js | No hay `.nvmrc`, `engines` ni versión de runtime declarada | No detectado como versión de proyecto |
| Next.js | `13.5.9` | `13.5.9` |
| React / React DOM | `18.2.0` | `18.2.0` |
| TypeScript | `5.1.6` | `5.1.6` |
| Prisma Client / CLI | `^5.13.0` / `^5.22.0` | `5.22.0` / `5.22.0` |
| Tailwind CSS | `^3.4.7` | `3.4.7` |
| OpenAI SDK | `4.3.1` | `4.3.1` |
| SWR | `2.2.0` | `2.2.0` |
| QR | `qrcode ^1.5.4` | `1.5.4` |
| Otros | `nanoid`, ESLint 8, TypeScript ESLint, `ts-node`, PostCSS, Autoprefixer | Versiones fijadas en `package-lock.json` |

Lenguajes: TypeScript/TSX para aplicación, JavaScript CommonJS para configuración y tests, SQL para migraciones. No se encontraron dependencias o manifests de Python, Go, Rust, Java, PHP, Docker, Compose o CI/CD en la raíz inspeccionada.

## 3. Estructura del proyecto

```text
.
├── components/                # Navegación, ChatBubble, hook público y QR
├── docs/                       # Vault Markdown de arquitectura, estado y backlog
│   ├── 00 Inicio/              # Entrada y estado general
│   ├── 01 MVP/                 # Estado de TAG y AI
│   ├── 02 TAG/                 # Arquitectura, QR, NFC y seguridad TAG
│   ├── 03 AI/                  # Canales, contexto, KB, providers, seguridad
│   ├── 04 Arquitectura/        # APIs, auth, DB y seguridad
│   ├── 05 Decisiones/          # Decisiones técnicas
│   ├── 06 Pendientes/          # Bugs, hardening y backlog
│   ├── 07 Pruebas/             # Checklists y pruebas documentadas
│   └── 08 Roadmap/             # Roadmap
├── lib/                        # Prisma singleton, autenticación/sesión, filtros AI
├── pages/                      # Páginas Next.js Pages Router y API Routes
│   ├── admin/                  # Panel TAG, páginas legacy AI, login/settings
│   ├── ai/                     # Login, simulador interno y conversaciones
│   ├── api/                    # Endpoints REST/API Routes
│   ├── tag/                    # Página pública y simulador TAG
│   ├── _app.tsx                # Shell y navegación compartidos
│   ├── index.tsx               # Home
│   └── chat.tsx                # Redirección antigua a Home
├── prisma/
│   ├── migrations/             # Migraciones activas PostgreSQL
│   ├── migrations-sqlite-backup/ # Migraciones antiguas de respaldo
│   ├── schema.prisma           # Modelo relacional
│   └── seed.ts                 # Datos demo y Knowledge Base
├── scripts/                   # Provisioning CLI de usuario y contexto AI
├── services/
│   ├── ai/                     # Contexto, conversación, KB y providers
│   ├── tag/                    # Validación y lógica de negocio TAG
│   └── whatsapp/               # Modo/reexportación; no integración Cloud real
├── styles/globals.css         # Tailwind y estilos globales/AI
├── tests/ownership.test.cjs    # Nueve pruebas focalizadas con Prisma fake
├── types/qrcode.d.ts          # Tipos auxiliares QR
├── middleware.ts              # Protección de páginas /admin y /ai
├── package.json / lock        # Scripts y dependencias npm
├── next.config.js             # Configuración mínima Next
├── tsconfig.json              # TypeScript estricto, noEmit
├── tailwind.config.js
├── postcss.config.js
└── .env.example               # Plantilla de configuración (no contiene valores reales)
```

`docs/.obsidian/` es configuración local del Vault, no configuración de la aplicación. `.env` existe localmente y está ignorado; no se inspeccionó su contenido. `prisma/dev.db` puede existir como artefacto local ignorado, pero no es la datasource declarada ni se inspeccionó.

## 4. Arquitectura y flujo principal

```mermaid
flowchart LR
  Browser --> Pages[Next.js Pages Router]
  Pages --> API[API Routes]
  API --> Auth[Auth por token/cookie HMAC]
  Auth --> Principal[ADMIN_USER_ID / AI_USER_ID]
  API --> Services[Servicios TAG / AI]
  Services --> Prisma[Prisma Client]
  Prisma --> PG[(PostgreSQL)]
  AI[Servicio AI] --> KB[KnowledgeBase]
  AI --> Provider[Ollama / OpenAI / Gemini / fallback]
  PublicChat[ChatBubble público] --> PublicAPI[/api/chat/message]
  PublicAPI --> AI
  N8N[n8n externo] --> N8NAPI[/api/integrations/n8n/*]
  N8NAPI --> AI
```

### TAG

1. `/admin/tags` envía `POST /api/tags`.
2. `requireAdminUser()` valida token/sesión y resuelve `ADMIN_USER_ID` a un `User` existente.
3. `createProfileAndTag()` valida los campos y crea `Business`, `DigitalProfile` y `Tag` dentro de una transacción; `ownerId` viene del servidor.
4. `/admin/profile` obtiene los perfiles propios y guarda cambios con `PATCH /api/profiles/[id]`. El estado TAG se cambia con `PATCH /api/tags/[id]`.
5. QR se construye en cliente con la URL pública. `/tag/[id]` carga datos por SSR desde Prisma.

### AI

1. `/ai/login` envía `POST /api/ai/login`; AI usa credencial/cookie distinta de TAG.
2. `/api/ai/init` resuelve el negocio técnico `TELAR AI`; la página `/ai` abre una simulación interna.
3. `/api/ai/message` toma `from` y `text`, resuelve el negocio en servidor y no usa el `businessId` enviado por el cliente.
4. `handleIncoming()` prioriza una conversación `human`, luego `open` y, si no encuentra ninguna, crea una nueva; solo llama `answerMessage()` fuera del handoff (`services/ai/conversation.ts:24,30,36,40,66,71`).
5. `answerMessage()` aplica fast path/security path, selecciona KB, carga hasta seis mensajes previos y usa el provider configurado o fallback.
6. `/ai/conversations` lista, filtra, permite cambiar estado y exportar JSON.

### Handoff humano

- Backend: `handleIncoming()` reutiliza primero la conversación `human` más reciente del mismo `businessId` y remitente, persiste la entrada con `from` original e `isFromAI: false`, y devuelve `{ handedOff: true, aiReply: null }` sin llamar `answerMessage()` (`services/ai/conversation.ts:24,30,60,62,66,67,71`).
- El endpoint `POST /api/ai/conversations/[id]/messages` exige auth AI, filtra por owner, solo escribe si `state === 'human'`, guarda `from: 'human'` e `isFromAI: false` y responde 404 para conversaciones inexistentes o ajenas (`pages/api/ai/conversations/[id]/messages.ts:10,22,23,26,28,35,37,49`).
- En `/ai/conversations`, el composer solo aparece para `state === 'human'`; “Reabrir asistente” envía PATCH con `state: 'open'` (`pages/ai/conversations.tsx:141,193,195,208,214`).
- En chat público, `handedOff === true` añade un aviso de sistema con `kind: 'system'` y no agrega `aiReply` (`components/usePublicChat.ts:36,37`).
- Chat público y n8n responden HTTP 200 con `handedOff` booleano y `aiReply: null` en handoff (`pages/api/chat/message.ts:32,34,35`; `pages/api/integrations/n8n/chat.ts:40,42,43`).

### Contexto AI y mutaciones

`getAIContext(ownerId?)` busca un negocio llamado `TELAR AI` sin `DigitalProfile`. Si no existe, puede crearlo; si faltan o cambiaron entradas KB, las sincroniza. Con `ownerId` y propietario nulo, todavía asigna el propietario automáticamente. Por tanto, `/api/ai/init` es semánticamente GET pero puede producir escrituras indirectas. Chat público y n8n llaman el resolver sin `ownerId`.

## 5. Comandos esenciales

| Propósito | Comando | Observaciones |
|---|---|---|
| Instalar | `npm install` | Usa `package-lock.json`. |
| Desarrollo | `npm run dev` | Next dev; usa variables locales. |
| Build | `npm run build` | Ejecuta `prisma generate && next build`. |
| Producción | `npm start` | Ejecuta `next start`; requiere build previo. |
| Generar cliente | `npm run prisma:generate` | No aplica migraciones. |
| Migración dev | `npm run prisma:migrate` | Ejecuta `prisma migrate dev --name init`; no es un comando de despliegue. |
| Seed | `npm run seed` | Crea/asegura TAG demo y KB; no crea usuarios. Puede crear contexto AI sin owner. |
| Crear User | `npm run provision:user -- --email=... --name="..."` | Crea una cuenta nueva con contraseña inicial leída desde `TELAR_USER_PASSWORD`; falla si el correo ya existe y no cambia cuentas existentes. |
| Revisar contexto AI | `npm run provision:ai-context` | Dry-run por defecto. |
| Asignar contexto AI | `npm run provision:ai-context -- --apply` | Escritura explícita, solo si `ownerId` está nulo; no sobreescribe otro owner. |
| Test ownership | `npm run test:ownership` | `node --test`; fixtures en memoria y módulo Prisma sustituido antes de importar handlers. |
| Typecheck | `npx tsc --noEmit` | No emite JS. |

No hay scripts `lint`, `test` general, `test:e2e`, `migrate:deploy` o despliegue declarados. No se detectó un comando de CI/CD o despliegue.

## 6. Configuración y variables de entorno

La fuente revisada es `.env.example`; sus valores son plantilla, no configuración efectiva. No leer `.env` ni copiar secretos a logs/documentación.

| Variable | Uso detectado |
|---|---|
| `DATABASE_URL` | URL de conexión Prisma PostgreSQL. |
| `DIRECT_URL` | Declarada como requerida por `datasource.directUrl` en `schema.prisma`. **No aparece en `.env.example`**, posible bloqueo al seguir literalmente el setup documentado. |
| `ADMIN_TOKEN` / `AI_TOKEN` | Credenciales globales separadas por área. |
| `ADMIN_USER_ID` / `AI_USER_ID` | IDs `User` asociados a cada token para filtrar recursos. |
| `N8N_WEBHOOK_SECRET` | Secreto del header `x-n8n-secret` para endpoints n8n. |
| `AI_PROVIDER` | `ollama`, `openai`, `gemini` o `fallback`; el ejemplo selecciona Ollama. |
| `OLLAMA_BASE_URL`, `OLLAMA_MODEL` | URL y modelo local. El ejemplo deja el modelo vacío; Ollama lanza error sin uno y el motor AI recurre a fallback. |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | SDK OpenAI; default declarado del modelo `gpt-4o`. |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Gemini `generateContent`. |
| `WHATSAPP_MODE`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_TOKEN` | Variables presentes en plantilla; no se encontró consumo que implemente Cloud API. |

Next se configura mínimamente con `reactStrictMode`; TypeScript declara `strict`, `noEmit`, `moduleResolution: node`, target ES2020 e `incremental`. Tailwind procesa `pages/`, `components/` y `app/`; la aplicación observada usa Pages Router. No hay Docker, Compose, configuración de CI, `engines`, `.nvmrc` ni plataforma de despliegue detectados.

## 7. API, base de datos e integraciones

### Rutas observadas

| Método | Ruta | Acceso/función |
|---|---|---|
| `POST` | `/api/admin/login` | Login por `ADMIN_TOKEN`, emite cookie HMAC. |
| `POST` | `/api/ai/login` | Login por `AI_TOKEN`, emite cookie HMAC AI. |
| `POST` | `/api/ai/logout` | Elimina cookie AI. |
| `GET` implícito | `/api/ai/init` | Resuelve contexto; no valida método y puede escribir. |
| `POST` | `/api/ai/message` | Mensaje AI privado; `businessId` del cliente no se usa. |
| método no restringido | `/api/ai/conversations` | Lista por owner y fecha. |
| `PATCH` | `/api/ai/conversations/[id]` | Cambia estado `open`/`human`, filtrando owner. |
| método no restringido | `/api/ai/conversations/export-json` | Exporta conversaciones propias y mensajes como JSON. |
| `POST` | `/api/chat/message` | Chat público, valida sesión y texto hasta 2000 caracteres. |
| `GET` | `/api/tags/[id]` | TAG público; TAG inactivo devuelve respuesta reducida. |
| `POST` | `/api/tags` | Crea negocio/perfil/TAG; owner del servidor. |
| `GET` | `/api/profiles` | Lista perfiles propios. |
| `PATCH` | `/api/profiles/[id]` | Actualiza perfil/datos del negocio propio. |
| `PATCH` | `/api/tags/[id]` | Cambia estado de TAG propio. |
| `POST` | `/api/integrations/n8n/chat` | Chat AI con secreto n8n; no idempotente. |
| `POST` | `/api/integrations/n8n/classify` | Clasificación JSON con secreto n8n; respuesta `502` si provider/JSON falla. |

No hay operaciones `DELETE`. Los handlers de conversaciones, exportación e init no rechazan explícitamente otros métodos HTTP.

### Modelo Prisma

- `User` tiene `email` único, `name`, `password?` y relación uno-a-muchos con negocios. `password` no participa en el login actual.
- `Business` contiene datos comerciales, `ownerId?`, perfil único, Knowledge Base y conversaciones.
- `DigitalProfile` pertenece a un Business y tiene tags.
- `Tag` identifica URL pública y estado; `identifier` único.
- `KnowledgeBase` pertenece a Business.
- `Conversation` pertenece a Business y agrupa `Message`.
- La migración `20260919120000_add_business_owner` añade owner nullable, FK e índice. No se hizo verificación de migraciones en esta generación de contexto.

### Integraciones externas

- Providers: Ollama local, OpenAI SDK, Gemini API; fallback basado en KB. OpenAI no establece timeout explícito en este wrapper; Ollama/Gemini establecen 60 segundos.
- n8n: endpoints funcionales para chat/clasificación; el chat aún no tiene rate limit ni idempotency key (`pages/api/integrations/n8n/chat.ts:40,42,43`). El workflow Gmail activo vive en la instancia externa de n8n, es one-way y no está versionado en este repo.
- WhatsApp Cloud API real: bloqueado por falta de un número WhatsApp Business; no hay webhook ni envío/recepción real en el repo.
- Gmail vía n8n: canal real one-way; el workflow clasifica y actúa sobre mensajes, pero no persiste las clasificaciones de vuelta en TELAR ni está versionado en el repo (workflow externo confirmado).
- NFC físico: bloqueado por falta de permiso/credencial externa; el repo solo incluye simulación, no lector/hardware.

## 8. Convenciones y testing

- TypeScript/TSX, Pages Router, alias de importación relativos; TypeScript `strict`.
- Servicios de negocio bajo `services/`, endpoints finos en `pages/api/`, auth/Prisma/utilidades en `lib/`.
- Formularios cliente llaman API Routes con `fetch`; APIs responden JSON y usan códigos comunes `400`, `401`, `404`, `409`, `500`, `503` según flujo.
- React state/SWR para UI; no se detecta un sistema global de tipos de dominio compartidos: abundan `any` en páginas.
- ESLint usa `eslint:recommended`, React y TypeScript ESLint; no hay formatter configurado ni script lint npm.
- Hay un único archivo de tests: `tests/ownership.test.cjs`, catorce casos sobre aislamiento TAG/AI, provisioning de owner y handoff. Prisma se reemplaza por fake; no es E2E ni prueba PostgreSQL. No hay tests adicionales de providers, KB, fast/security path, UI, NFC, WhatsApp, auth real o CSRF.
- No se ejecutaron tests ni build al generar este documento. El estado de ejecución debe validarse aparte.

## 9. Riesgos, pendientes y deuda técnica

### Riesgos confirmados en código

1. **P1 #1 RESUELTO — datos públicos TAG:** `lib/public-tag.ts` proyecta explícitamente los campos permitidos. La ficha SSR y el GET público usan el DTO compartido; TAG inactivo solo serializa `identifier` y `status`, y el activo no incluye IDs internos, `ownerId`, fechas ni `imageUrl`. P2 pendiente: evaluar 404 HTTP dedicado para TAG inexistente en SSR.
2. **Tokens globales:** ownership filtra APIs por `ADMIN_USER_ID`/`AI_USER_ID`, pero esos IDs son configuración por instalación; no hay identidad individual ligada a cookie. Es aislamiento por principal configurado, no multiusuario real.
3. **Propietarios históricos:** negocios con owner nulo no aparecen en listas privadas. `provision:ai-context` cubre solo el contexto técnico AI; no hay herramienta general de backfill TAG/conversaciones.
4. **Mutaciones implícitas:** `GET /api/ai/init` llama `getAIContext()`, que puede crear contexto, sincronizar KB y asignar owner. También puede ejecutarse con métodos distintos porque no valida método.
5. **P1 #4 RESUELTO — handoff humano:** `handleIncoming()` reutiliza conversaciones `human` y no llama AI; el endpoint y la UI permiten responder y reabrir (`services/ai/conversation.ts:66,67`; `pages/api/ai/conversations/[id]/messages.ts:22,26,28,35`; `pages/ai/conversations.tsx:112,141`).
6. **Abuso/reintentos:** endpoint público de chat sin rate limit; n8n chat puede duplicar mensajes en reintentos.
7. **Rendimiento:** list/export AI cargan todas las conversaciones y mensajes propietarios, sin paginación; filtro de fechas ocurre en memoria.
8. **Rutas legacy:** `/admin/ai` y `/admin/conversations` no están enlazadas desde navegación vigente, mezclan auth ADMIN con APIs AI y el UI antiguo manda un `businessId` ya ignorado por API. README todavía recomienda `/admin/conversations`.
9. **Configuración incompleta de ejemplo:** schema Prisma requiere `DIRECT_URL`, ausente de `.env.example`; README declara SQLite aunque schema y migraciones activas son PostgreSQL.
10. **Configuración de provider:** `.env.example` selecciona Ollama pero deja `OLLAMA_MODEL` vacío; en ese estado el provider falla y la respuesta recae en fallback de KB. OpenAI no se selecciona automáticamente mientras `AI_PROVIDER=ollama`.

### Estado conocido del backlog

- **Implementado en código, documentación parcialmente obsoleta:** ownership en APIs privadas, provisioning CLI de usuario/contexto, tests de aislamiento y handoff humano. Algunos docs TAG/AI/checklist aún lo marcan pendiente. La identidad sigue siendo global, así que “multiusuario real” sí está pendiente.
- **Pendiente real:** WhatsApp Cloud API y NFC físico (bloqueados por terceros), historial visible ChatBubble tras recarga, rate limiting, idempotencia n8n, health checks, observabilidad, backups/recuperación y pruebas E2E.
- **Parcial:** provider timeout/UX, settings, edición completa de perfil, Knowledge Base administrable, cobertura de seguridad, onboarding/configuración de usuarios.
- **Gmail externo:** existe un workflow activo vía n8n, one-way; no persiste clasificaciones en TELAR y no está versionado en el repo.

### Funcionalidades ausentes o abandonadas

- No hay APIs de borrado, facturación, roles/permisos, gestión de usuarios web, carga de imágenes, analytics ni panel para administrar KB.
- `services/whatsapp/index.ts` es compatibilidad de modo/reexportación, no flujo funcional.
- `/admin/ai` y `/admin/conversations` parecen rutas heredadas; no eliminarlas sin confirmar uso/deep links.

## 10. Guía rápida para una IA

### Qué leer primero

1. `package.json`, `README.md`, `.env.example`, `schema.prisma` y `middleware.ts` para stack, configuración y límites de acceso.
2. Para TAG: `pages/admin/tags.tsx`, `pages/admin/profile.tsx`, `pages/api/tags/*`, `pages/api/profiles/*`, `services/tag/index.ts`, `pages/tag/[id].tsx` y `components/TagQr.tsx`.
3. Para AI: `pages/ai/*`, `components/ChatBubble.tsx`, `components/usePublicChat.ts`, `pages/api/ai/*`, `pages/api/chat/message.ts`, `services/ai/*`, `lib/ai-conversations.ts`.
4. Para ownership: `lib/admin-auth.ts`, `lib/ai-auth.ts`, `services/tag/index.ts`, `services/ai/context.ts` y `tests/ownership.test.cjs`.
5. Para integraciones: `pages/api/integrations/n8n/*`, `services/whatsapp/index.ts` y configuración documentada.

### Reglas para no romper el proyecto

- No aceptar un `ownerId`/`businessId` del cliente como autorización; derivar propietario desde `requireAdminUser`/`requireAiUser` y filtrar la consulta Prisma.
- Las páginas públicas TAG deben usar una proyección explícita, nunca serializar el objeto Prisma completo.
- No añadir usuario/negocio por defecto al seed; provisioners son explícitos. `provision:ai-context` es dry-run por defecto y solo `--apply` escribe.
- No retirar la autoasignación de `getAIContext()` sin coordinar primero con `/api/ai/init`, `/api/ai/message`, chat público, n8n y seed.
- Si `handedOff === true`, ningún canal debe inyectar una respuesta AI (`services/ai/conversation.ts:66,67`; `pages/api/chat/message.ts:34,35`; `pages/api/integrations/n8n/chat.ts:42,43`).
- `handleIncoming()` busca primero `human`, después `open` y, si no encuentra, crea una conversación nueva (`services/ai/conversation.ts:24,28,30,36,40`).
- El endpoint `POST /api/ai/conversations/[id]/messages` solo escribe con `state === 'human'`, filtra por owner y devuelve 404 para conversaciones inexistentes o ajenas (`pages/api/ai/conversations/[id]/messages.ts:22,23,26,28,35,49`).
- Mantener uso de Pages Router; no introducir App Router/infraestructura adicional sin decisión explícita.
- No ejecutar migraciones, provisioning con `--apply` o escrituras de prueba sobre DB compartida sin autorización y entorno desechable.
- Mantener los tests de ownership aislados del Prisma real; operaciones nuevas no simuladas deben fallar en el fake.
- No editar `.env` ni `docs/.obsidian/`; conservar cambios locales ajenos al ticket.
- Validación habitual: `npx tsc --noEmit`, `npm run test:ownership`, `git diff --check`. Para Prisma solo cuando la tarea lo requiera: `npx prisma validate`; el estado de migraciones requiere DB y autorización explícitas.

### Cómo añadir una feature típica

1. Definir comportamiento/propietario y distinguir ruta privada de pública.
2. Añadir lógica de dominio al servicio existente (`services/tag` o `services/ai`).
3. Añadir API Route bajo `pages/api`, validar método/payload, auth, owner y códigos de error.
4. Conectar desde la página/componente existente con estados de carga/error/éxito.
5. Añadir prueba `node:test` con Prisma falso para owner, acceso cruzado, no encontrado y casos sin side effect.
6. Actualizar docs de estado/backlog solo si la conducta quedó implementada y validada.
7. Revisar diff/status y no mezclar docs o cambios locales no relacionados.

## 11. Prompt de arranque para futuras sesiones

```text
Trabaja en TELAR, Next.js 13 Pages Router + TypeScript + Prisma/PostgreSQL.
Antes de editar, revisa git status y los archivos concretos del flujo. No sobrescribas cambios locales.
TAG usa services/tag, APIs /api/tags y /api/profiles, y páginas /admin y /tag.
AI usa services/ai, APIs /api/ai, chat público /api/chat/message y n8n /api/integrations/n8n.
Las APIs privadas aplican ownership filtrando Business.ownerId mediante ADMIN_USER_ID o AI_USER_ID; son principales globales, no sesiones multiusuario.
No aceptes ownerId/businessId del cliente para autorizar. No expongas objetos Prisma completos en páginas públicas.
El test: npm run test:ownership usa fixtures y Prisma fake; no lo conectes a DB real.
No ejecutes seed, provisioning --apply, migraciones, escrituras DB, commit o push salvo instrucción expresa.
Valida cambios con npx tsc --noEmit, npm run test:ownership y git diff --check.
No cambies docs/.obsidian ni secretos. Mantén alcance acotado e informa brechas/documentación obsoleta sin asumir que están resueltas.
```

## 12. P0 de seguridad

- Rotar `x-n8n-secret` expuesto en el workflow Gmail externo y moverlo a credentials de n8n. Es una deuda de configuración manual, no de código del repo.
## Estado vigente de implementación — 2026-10-15

Esta sección refleja los cambios posteriores a la inspección estática del 2026-09-26; prevalece cuando contradice el snapshot histórico anterior.

### Cambios en `main` y estado de despliegue

- `getAIContext()` es de lectura. La preparación explícita y sincronización de Knowledge Base usa `ensureAIContext()` desde `POST /api/ai/init` y el seed.
- Rate limiting está conectado al chat público, mensaje AI privado y endpoints n8n; incluye límites por IP/sesión/owner y `429`. Las migraciones están aplicadas en la instancia Supabase configurada; verificar otros entornos antes de habilitar el código allí.
- `GET /api/health` comprueba conexión PostgreSQL y solo responde estados genéricos.
- OpenAI tiene timeout configurable mediante `OPENAI_TIMEOUT_MS` (predeterminado 60 s).
- El chat público restaura hasta 100 mensajes desde `sessionStorage` de la pestaña.
- La lista de conversaciones está paginada; muestra los 100 mensajes más recientes por conversación y permite cargar anteriores.
- La Knowledge Base tiene UI/API para entradas personalizadas; el contenido oficial del sistema permanece de solo lectura.
- n8n puede deduplicar chat con `Idempotency-Key` y persistir resúmenes de clasificación sin guardar el cuerpo completo del correo.
- El backfill de negocios tiene script con simulación por defecto; la asignación requiere mapping revisado y `--apply`.
- El perfil permite editar el nombre del negocio y el título público por separado. TAG SSR devuelve 404 para identificadores inexistentes. Las rutas legacy de AI redirigen a `/ai`.
- README y variables de ejemplo documentan PostgreSQL, `DIRECT_URL`, límites y endpoints actuales.
- El login por correo y contraseña usa hash scrypt y cookie HMAC común de ocho horas; las rutas privadas resuelven al propietario autenticado. El alta se hace por CLI, sin registro público. El código está desplegado en Vercel Production; el token global continúa temporalmente como compatibilidad.
- La sincronización de Knowledge Base actualiza entradas oficiales, elimina sus duplicados y quita entradas oficiales obsoletas sin borrar entradas personalizadas.
- El 2026-10-15 se configuró `ADMIN_USER_ID` en Vercel Production para `admin@example.com`, se redeplegó y promovió el commit `c1374b6` al alias `telar-kappa.vercel.app`. El login de compatibilidad y las APIs de perfiles, dashboard, conversaciones y Knowledge Base respondieron correctamente. Esta verificación no cubre el login individual del propietario.

### Migraciones recientes y estado actual

1. `20261015120000_restore_business_ownerid_index` restaura `Business_ownerId_idx`.
2. `20261015130000_add_email_classification` crea la tabla de clasificaciones de correo.
3. `20261015140000_add_n8n_idempotency` añade claves idempotentes a mensajes y la tabla de reservas n8n.
4. `20261015150000_add_editable_knowledge` añade el indicador de entradas editables.
5. `20261015160000_add_message_pagination_index` añade índice para mensajes por conversación y fecha.

El 2026-10-15 se aplicaron estas cinco migraciones a la instancia Supabase configurada. `npx prisma migrate status` confirmó que las ocho migraciones del repo están aplicadas allí. No se consultó ningún entorno adicional.

### Validación local realizada

- `npx tsc --noEmit`: correcto.
- `npx prisma validate`: schema válido.
- `npx prisma generate`: en una ejecución anterior no completó por `EPERM` en `node_modules/@prisma/client`; no se detuvieron procesos Node. Posteriormente el usuario confirmó que pudo generar Prisma y que un build local falló por lint; el commit `c1374b6` corrigió esos errores y Vercel lo desplegó como Ready.
- No se ejecutaron pruebas. Las migraciones de la instancia Supabase configurada se aplicaron posteriormente el 2026-10-15.

### Pendientes externos o que necesitan decisión

- Rotar `N8N_WEBHOOK_SECRET` y actualizar/versionar el workflow en n8n; debe enviar `Idempotency-Key` en chat y `externalId` al clasificador.
- Verificar las migraciones y el mapping en cada entorno adicional antes de aplicar allí los cambios; en el Supabase configurado aquí las migraciones están al día y los cuatro negocios aprobados ya están asignados.
- El modelo de propietario quedó definido por el usuario. `SESSION_SECRET` está configurado en el `.env` local y en Vercel Production; la cuenta demo está provisionada. Falta validar el login individual y el aislamiento del propietario en producción antes de retirar los tokens legacy.
- Backups, métricas, alertas y despliegues dependen del proveedor/operación.
- WhatsApp y NFC siguen bloqueados por terceros.
- La búsqueda semántica requiere decidir proveedor/modelo de embeddings y almacenamiento vectorial.
- La carga de logos requiere decidir almacenamiento; el borrado requiere acordar retención de conversaciones y datos.
