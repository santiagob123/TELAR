# Autenticación

## Estado

🟡 Parcial

- `/admin` usa `ADMIN_TOKEN` y cookie HMAC `telar_admin_session`.
- `/ai` usa `AI_TOKEN` y cookie HMAC separada.
- Las cookies son `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
- No existe login por usuario ni password hash funcional.
- `User` existe en Prisma pero no participa en runtime.

El token administrativo es global y no representa un usuario individual.
