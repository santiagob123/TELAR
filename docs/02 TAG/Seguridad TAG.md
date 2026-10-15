# Seguridad TAG

## Estado

🟡 Parcial

## Confirmado

- `/admin/*` está protegido por middleware mediante sesión individual o, temporalmente, `ADMIN_TOKEN`.
- Las APIs administrativas llaman a `requireAdminUser`, que resuelve la cuenta autenticada y filtra negocios por su `ownerId`; el token anterior usa `ADMIN_USER_ID` como compatibilidad.
- La sesión usa cookie `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
- Los identificadores de TAG validan caracteres y longitud.
- Los estados aceptados son `active` e `inactive`.

## Ownership implementado

- `POST /api/tags` asigna `Business.ownerId` al `User` de `ADMIN_USER_ID`.
- `GET /api/profiles`, `PATCH /api/profiles/[id]` y `PATCH /api/tags/[id]` filtran por `Business.ownerId`.
- Un recurso ajeno responde `404` para no revelar su existencia.
- `GET /api/tags/[id]` y `/tag/[id]` siguen siendo públicos por diseño.

## Riesgos pendientes

- Los tokens globales siguen disponibles de forma temporal; deben retirarse tras validar el login individual y el ownership de los datos históricos.
- Los negocios históricos con `ownerId` nulo requieren una asignación operativa controlada.
- No hay rate limiting documentado para login.

Ver: [[Autenticación]] y [[Pendientes TAG]].
