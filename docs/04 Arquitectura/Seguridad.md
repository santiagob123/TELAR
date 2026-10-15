# Seguridad

## Estado

🟡 Parcial

## Confirmado

- Rutas `/admin` y `/ai` protegidas por middleware.
- APIs privadas comprueban token o sesión HMAC.
- APIs TAG privadas filtran por `Business.ownerId` del `ADMIN_USER_ID` validado.
- APIs AI privadas filtran conversaciones y contexto por el propietario de la sesión administrativa o por el principal AI de compatibilidad.
- AI tiene security-path previo al provider.
- TAG valida identificadores, estados y campos principales.

## Riesgos documentados

- Login por usuario usa `SESSION_SECRET` y una cookie de sesión HMAC; contraseñas guardadas con scrypt. Los tokens `ADMIN_TOKEN` y `AI_TOKEN` siguen como compatibilidad temporal y se vinculan a sus principales configurados.
- Los registros históricos con `ownerId` nulo no deben exponerse a APIs privadas hasta ser asignados explícitamente.
- Rate limiting usa `RateLimitBucket`; en desarrollo hay fallback en memoria si falta la tabla. En producción el limitador sigue fallando de forma cerrada y requiere la migración aplicada.
- No hay tests automatizados.
- El build local ha estado bloqueado por EPERM de Prisma.
- La configuración real de secretos y producción queda ⚪ Por verificar.
