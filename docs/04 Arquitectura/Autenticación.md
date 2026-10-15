# Autenticación

## Estado

🟡 Implementación por usuario disponible; cuenta demo creada y secretos configurados localmente y en Vercel Production. Los cambios de código aún deben desplegarse.

- `/admin` y su sección `/ai` aceptan una sesión individual por correo y contraseña. Ambos espacios comparten el mismo menú administrativo y el mismo logout.
- La contraseña se guarda como hash scrypt; nunca se conserva en texto claro.
- La sesión común `telar_user_session` tiene firma HMAC, caduca en ocho horas y es `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
- `requireAdminUser` y `requireAiUser` resuelven el ID de la cuenta autenticada. Las APIs TAG filtran negocios por `Business.ownerId`; las APIs AI filtran contexto y conversaciones por el mismo propietario.
- Las sesiones de propietario consultan y gestionan solo sus negocios; el token de compatibilidad conserva acceso global de administrador a negocios, perfiles, TAGs, dashboard, conversaciones y lectura de Knowledge Base, incluyendo correo de propietario en vistas globales.
- El alta de usuarios se realiza con `TELAR_USER_PASSWORD` y `npm run provision:user`; el comando rechaza correos existentes para evitar cambiar credenciales sin intención. No se creó un endpoint público de registro.
- En la sección TELAR AI se acepta la misma sesión/cookie de administración; el fallback `ADMIN_TOKEN` se vincula a `ADMIN_USER_ID`. `AI_TOKEN`/`AI_USER_ID` siguen aceptándose temporalmente en las APIs para instalaciones existentes.
- Las rutas de login limitan intentos por IP con `RateLimitBucket`; si esa tabla no está disponible, usan un límite temporal en memoria por proceso para que el acceso no quede bloqueado. El resto de límites de aplicación sigue fallando de forma cerrada.

## Configuración

1. `SESSION_SECRET` está configurado localmente y en Vercel Production; requiere desplegar una versión que incluya el código de login.
2. Las ocho migraciones están aplicadas en la instancia Supabase configurada; verifica otros entornos antes de habilitar allí las funciones.
3. Se creó una cuenta de demostración mediante `npm run provision:user`; las contraseñas iniciales deben tener al menos 12 caracteres.
4. El mapping de los cuatro negocios demo fue revisado, aprobado y aplicado en Supabase; verificarlo de nuevo antes de repetir el backfill en otro entorno.
5. Una vez validado el login individual, retira los tokens globales y sus IDs de principal.

La interfaz no incluye registro público ni recuperación de contraseña; las cuentas se aprovisionan desde el entorno de operación.
