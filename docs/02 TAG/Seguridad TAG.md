# Seguridad TAG

## Estado

🟡 Implementada; queda validar login individual en Production y retirar el token legacy tras la transición.

## Confirmado

- `/admin/*` está protegido por middleware mediante sesión individual o, temporalmente, `ADMIN_TOKEN`.
- Las APIs administrativas llaman a `requireAdminUser`, que resuelve la cuenta autenticada y filtra negocios por su `ownerId`; el token anterior usa `ADMIN_USER_ID` como compatibilidad.
- La sesión usa cookie `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
- Los identificadores de TAG validan caracteres y longitud.
- Los estados aceptados son `active` e `inactive`.

## Ownership implementado

- `POST /api/tags` asigna `Business.ownerId` al usuario autenticado.
- `GET /api/profiles`, `PATCH /api/profiles/[id]` y `PATCH /api/tags/[id]` filtran por `Business.ownerId`.
- Un recurso ajeno responde `404` para no revelar su existencia.
- `GET /api/tags/[id]` y `/tag/[id]` siguen siendo públicos por diseño.

## Riesgos pendientes

- Los tokens globales siguen disponibles de forma temporal; deben retirarse tras validar el login individual y el ownership de los datos históricos.
- Los cuatro negocios históricos aprobados ya se asignaron a la cuenta demo en la instancia Supabase configurada; comprobar otros entornos por separado.
- El login administrativo ya tiene rate limiting; falta probar límites y fuerza bruta en un entorno controlado.

Ver: [[Autenticación]] y [[Pendientes TAG]].
