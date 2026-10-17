# Seguridad

## Estado

🟡 Parcial

## Confirmado

- Rutas `/admin` y `/ai` protegidas por middleware.
- APIs privadas comprueban token o sesión HMAC.
- Mutaciones autenticadas protegidas con validación del origen; login y logout la exigen.
- Cookies legacy admin/AI firmadas con expiración de ocho horas; secretos comparados con tiempo constante.
- Rate limiting persistente; el login falla cerrado en producción si no puede acceder al limitador.
- Cabeceras `nosniff`, `SAMEORIGIN`, `Referrer-Policy` y `Permissions-Policy`; HSTS en producción.
- APIs TAG privadas filtran por `Business.ownerId` del `ADMIN_USER_ID` validado.
- APIs AI privadas filtran conversaciones y contexto por el propietario de la sesión administrativa o por el principal AI de compatibilidad.
- AI tiene security-path previo al provider.
- TAG valida identificadores, estados y campos principales.

## Riesgos documentados

- Login por usuario usa `SESSION_SECRET` y una cookie de sesión HMAC; contraseñas guardadas con scrypt. Los tokens `ADMIN_TOKEN` y `AI_TOKEN` siguen como compatibilidad temporal y se vinculan a sus principales configurados.
- Los cambios locales de hardening aún no están desplegados ni validados en runtime.
- Los registros históricos con `ownerId` nulo no deben exponerse a APIs privadas hasta ser asignados explícitamente.
- Rate limiting usa `RateLimitBucket`; en desarrollo hay fallback en memoria si falta la tabla. En producción el limitador falla cerrado y requiere la migración aplicada.
- No hay pruebas E2E runtime de CSRF, expiración de cookies legacy, fuerza bruta y aislamiento admin/propietario. La prueba de ownership existente usa Prisma simulado.
- `npm audit` completo está limpio tras migrar Tailwind CSS 4.3.3. `npm run build` pasó el 2026-10-16.
- Las comprobaciones locales de cabeceras, rechazo CSRF, respuestas sin autenticación y expiración de cookies pasaron; falta desplegar y verificar dos cuentas en Production.
- La configuración real de secretos y producción queda ⚪ Por verificar.
