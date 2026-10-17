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
- `GET /api/ai/conversations/export-csv`
- `GET /api/ai/knowledge`
- `POST /api/ai/knowledge`
- `PATCH /api/ai/knowledge/[id]`
- `DELETE /api/ai/knowledge/[id]`
- `POST /api/ai/logout`
- `GET /api/health`

Las exportaciones JSON y CSV filtran por propietario y reutilizan los filtros `from` y `to` del listado. Las fechas se interpretan como calendario `America/Bogota`. El CSV aplana cada mensaje a una fila y neutraliza celdas que puedan ejecutar fórmulas al abrirse en hojas de cálculo.

### Integraciones

- `POST /api/integrations/n8n/chat`
- `POST /api/integrations/n8n/classify`

Las APIs TAG privadas resuelven al usuario autenticado y filtran por `Business.ownerId`. `PATCH /api/profiles/[id]` edita también `imageUrl`, que acepta vacío o una URL HTTP/HTTPS de hasta 2048 caracteres; la ficha pública muestra esa imagen. La carga de archivos requiere integrar un proveedor de almacenamiento. Las APIs AI privadas aplican el mismo ownership al contexto técnico y las conversaciones. El borrado disponible por API se limita a entradas personalizadas de Knowledge Base. El endpoint de readiness devuelve solo el estado genérico de aplicación/base de datos.

`GET /api/admin/users` lista las cuentas, el rol derivado de `ADMIN_USER_ID` y sus negocios asignados. `POST /api/admin/users` crea una cuenta propietaria con contraseña inicial hasheada. Ambos métodos requieren sesión o token de admin global; las cuentas propietarias reciben 403. La interfaz `/admin/users` ofrece el listado y alta básica. Reasignación, restablecimiento y baja de cuentas no están incluidos.
