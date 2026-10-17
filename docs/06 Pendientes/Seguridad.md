# Seguridad

## Implementado localmente el 2026-10-16

- Actualizadas Next.js `15.5.28`, `nanoid` `3.3.20` y Tailwind CSS `4.3.3` con su plugin PostCSS; `npm audit` reporta **0 vulnerabilidades**, también en dependencias de desarrollo.
- Comparación de tokens en APIs con comparación de tiempo constante; el middleware también evita comparar directamente los tokens de compatibilidad.
- Las cookies de compatibilidad de admin y AI caducan a las ocho horas y el servidor valida su expiración.
- Las mutaciones autenticadas y los endpoints de login/logout comprueban el origen de la solicitud.
- El limitador persistente de login falla cerrado en producción si la base de datos no está disponible; el fallback en memoria se limita a desarrollo.
- Añadidas cabeceras de seguridad globales y HSTS en producción.
- `npm run build` pasa; la vista local conserva el tema y la página inicial renderiza.
- Smoke local: página `200` con cabeceras, dashboard privado sin sesión `401`, y login/mutación desde origen externo `403`. Las cookies legacy aceptan firma vigente y rechazan expiración vencida con secretos efímeros de prueba.

Estos cambios están solo en el árbol local y **no se han desplegado**.

## Controles implementados

- Ownership y autorización por recurso en APIs privadas TAG/AI.
- Sesión individual con cookie HMAC protegida y contraseñas con hash scrypt.
- Rate limiting en login y rutas sensibles con límites persistentes; el login no usa fallback en memoria en producción.
- Errores de API saneados en las rutas principales.
- `ADMIN_USER_ID` asociado al token de compatibilidad en Vercel Production.

## Dependencias y verificaciones externas

- El token global sigue habilitado durante la transición. Probar el acceso del propietario y aislamiento en Production antes de retirarlo.
- Rotar `N8N_WEBHOOK_SECRET` reportado como expuesto en Vercel y n8n; comprobar que la credencial anterior se rechaza.
- Confirmar `SESSION_SECRET`/secretos de producción y rotación con responsables del entorno; no documentar valores.
- Desplegar estos cambios y correr pruebas runtime en Production de fuerza bruta, CSRF y alcance horizontal con dos cuentas antes de retirar tokens globales.

## Alcance conocido

Las pruebas de ownership del repo usan Prisma simulado y no son E2E. La comprobación del token administrativo valida el rol global de compatibilidad, no sesiones de propietario.
