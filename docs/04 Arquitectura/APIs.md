# APIs

## APIs principales

### Públicas

- `POST /api/chat/message`
- `GET /api/tags/[id]`
- ChatBubble público en `/` y página pública `/tag/[id]`; `/chat` redirige a `/`

### TAG administrativas

- `GET /api/profiles`
- `PATCH /api/profiles/[id]`
- `POST /api/tags`
- `PATCH /api/tags/[id]`

### AI privadas

- `POST /api/ai/login`
- `POST /api/ai/init`
- `POST /api/ai/message`
- `GET /api/ai/conversations`
- `PATCH /api/ai/conversations/[id]`
- `GET /api/ai/conversations/export-json`
- `POST /api/ai/logout`

La exportación JSON agrupa mensajes por conversación y reutiliza los filtros `from` y `to` del listado. Las fechas se interpretan como calendario `America/Bogota`.

### Integraciones

- `POST /api/integrations/n8n/chat`
- `POST /api/integrations/n8n/classify`

La autorización TAG actual usa `ADMIN_TOKEN`; ownership por usuario aún no está aplicado.
