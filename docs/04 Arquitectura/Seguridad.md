# Seguridad

## Estado

🟡 Parcial

## Confirmado

- Rutas `/admin` y `/ai` protegidas por middleware.
- APIs privadas comprueban token o sesión HMAC.
- AI tiene security-path previo al provider.
- TAG valida identificadores, estados y campos principales.

## Riesgos documentados

- `ADMIN_TOKEN` global sin ownership.
- No hay rate limiting confirmado.
- No hay tests automatizados.
- El build local ha estado bloqueado por EPERM de Prisma.
- La configuración real de secretos y producción queda ⚪ Por verificar.
