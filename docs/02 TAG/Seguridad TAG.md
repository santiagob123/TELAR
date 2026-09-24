# Seguridad TAG

## Estado

🟡 Parcial

## Confirmado

- `/admin/*` está protegido por middleware cuando `ADMIN_TOKEN` existe.
- Las APIs administrativas llaman a `requireAdminToken`.
- La sesión usa cookie `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
- Los identificadores de TAG validan caracteres y longitud.
- Los estados aceptados son `active` e `inactive`.

## Riesgos confirmados

- `ADMIN_TOKEN` es global; no identifica usuarios individuales.
- Las APIs de perfiles y tags no comprueban ownership.
- No hay relación runtime entre `User` y el usuario autenticado.
- No hay rate limiting documentado para login.

Ver: [[Autenticación]] y [[Pendientes TAG]].
