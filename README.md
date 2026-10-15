# TELAR

MVP web con Next.js 13 Pages Router, TypeScript, Prisma y PostgreSQL. Incluye TELAR TAG para perfiles públicos de negocio y TELAR AI para el chat y la gestión de conversaciones.

## Requisitos

- Node.js compatible con Next.js 13.5.9.
- PostgreSQL.
- Variables de entorno definidas a partir de `.env.example`.

`DATABASE_URL` debe apuntar a PostgreSQL. `DIRECT_URL` debe usar una conexión directa disponible para Prisma. No guardes credenciales reales en el repositorio.

## Instalación local

```bash
npm install
Copy-Item .env.example .env
```

Completa en `.env` `DATABASE_URL`, `DIRECT_URL` y `SESSION_SECRET` (mínimo 32 bytes aleatorios, por ejemplo con `openssl rand -hex 32`). Provisiona cada usuario desde PowerShell con:

```powershell
$env:TELAR_USER_PASSWORD = Read-Host "Contraseña inicial (mínimo 12 caracteres)"
npm run provision:user -- --email=usuario@example.com --name="Nombre"
Remove-Item Env:TELAR_USER_PASSWORD
```

Configura un provider de IA con sus credenciales y modelo si no usarás el fallback. `ADMIN_TOKEN`/`AI_TOKEN` y sus IDs quedan solo como compatibilidad temporal.

Aplica las migraciones y genera Prisma Client:

```bash
npx prisma migrate dev
npx prisma generate
```

Carga los datos iniciales cuando la base esté lista:

```bash
npm run seed
```

Inicia Next.js:

```bash
npm run dev
```

## Rutas principales

- `/` — página pública con ChatBubble.
- `/tag/[id]` — ficha pública TAG.
- `/admin` — administración TAG, con acceso por usuario y negocios filtrados por propietario.
- `/ai` — sección administrativa TELAR AI integrada en el panel; usa la misma sesión y menú que TAG, con contexto y conversaciones filtrados por propietario.
- `/ai/conversations` — gestión de conversaciones.
- `/ai/knowledge` — administrar entradas personalizadas de Knowledge Base.
- `/api/health` — readiness de la aplicación y conexión PostgreSQL.

El simulador de TELAR AI usa el negocio técnico `TELAR AI`; el endpoint de mensaje resuelve ese contexto en el servidor. No envíes un `businessId` confiable desde el cliente.

## Integración n8n

- `POST /api/integrations/n8n/chat` recibe `{ "text": "...", "sessionId": "..." }` y el header `x-n8n-secret`. Envía también `Idempotency-Key` estable por mensaje para deduplicar reintentos.
- `POST /api/integrations/n8n/classify` recibe `{ "text": "...", "subject": "...", "from": "...", "externalId": "..." }` y el mismo header. `externalId` es opcional y permite actualizar la misma clasificación ante reintentos.
- Define `N8N_WEBHOOK_SECRET` en el servidor y almacena el valor correspondiente en las credenciales del workflow n8n.

El workflow Gmail vive en n8n y su actualización/versionado siguen pendientes. El endpoint ya persiste solo los campos de clasificación (no el correo completo); aplica las migraciones antes de usar esa función.

## Límites de solicitudes

Los límites se configuran con `RATE_LIMIT_PUBLIC_IP_PER_MIN`, `RATE_LIMIT_PUBLIC_SESSION_PER_HOUR`, `RATE_LIMIT_AI_OWNER_PER_MIN`, `RATE_LIMIT_AI_OWNER_PER_HOUR` y `RATE_LIMIT_N8N_PER_MIN`. `RATE_LIMIT_TRUSTED_PROXIES` acepta una lista separada por comas de IPs proxy confiables. Déjala vacía si la aplicación no recibe tráfico a través de un proxy confiable.

La migración correctiva `restore_business_ownerid_index` debe aplicarse en cada entorno antes de habilitar el rate limiting. No se debe asumir que producción está migrada porque el archivo exista en el repositorio.
