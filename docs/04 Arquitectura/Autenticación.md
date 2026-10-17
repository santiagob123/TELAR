# Autenticación

## Estado

🟡 El acceso global para la sesión cuyo ID coincide con `ADMIN_USER_ID` está desplegado en Vercel Production (`8c5c678`). Falta validar con inicio de sesión individual de admin y propietario; el dashboard se comprobó con una sesión autenticada cuyo tipo no se pudo distinguir.

- `/admin` y su sección `/ai` aceptan una sesión individual por correo y contraseña. El usuario cuyo ID coincide con `ADMIN_USER_ID` recibe acceso global; los demás usuarios quedan limitados a sus negocios. Ambos espacios comparten menú y logout.
- La contraseña se guarda como hash scrypt; nunca se conserva en texto claro.
- La sesión común `telar_user_session` tiene firma HMAC, caduca en ocho horas y es `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
- Las cookies de compatibilidad `telar_admin_session` y `telar_ai_session` también expiran en ocho horas; el vencimiento se valida en servidor además del `Max-Age` del navegador.
- Las rutas de login/logout y mutaciones autenticadas comprueban el origen para mitigar CSRF. Las APIs usan comparación de tiempo constante para secretos de compatibilidad.
- Las APIs TAG y AI dan alcance global al usuario configurado en `ADMIN_USER_ID`; las sesiones de propietarios filtran negocios, contexto y conversaciones por `Business.ownerId`.
- Las sesiones de propietario consultan y gestionan solo sus negocios; el token de compatibilidad conserva acceso global de administrador a negocios, perfiles, TAGs, dashboard, conversaciones y lectura de Knowledge Base, incluyendo correo de propietario en vistas globales.
- El admin global puede crear cuentas propietarias desde `/admin/users`; la lista y alta son solo para admin. También existe `npm run provision:user`, que rechaza correos existentes. No hay registro público ni recuperación automática de contraseña.
- En la sección TELAR AI se acepta la misma sesión/cookie de administración; el fallback `ADMIN_TOKEN` se vincula a `ADMIN_USER_ID`. `AI_TOKEN`/`AI_USER_ID` siguen aceptándose temporalmente en las APIs para instalaciones existentes.
- Las rutas de login limitan intentos por IP con `RateLimitBucket`. Si la tabla o la base de datos no están disponibles, el login falla cerrado en producción (503); en desarrollo puede usar un límite temporal en memoria. El resto de límites de aplicación sigue fallando de forma cerrada.

## Configuración

1. `SESSION_SECRET` está configurado localmente y en Vercel Production. El despliegue Production incluye el código de login individual.
2. Las ocho migraciones están aplicadas en la instancia Supabase configurada; verifica otros entornos antes de habilitar allí las funciones.
3. Se creó una cuenta de demostración mediante `npm run provision:user`; las contraseñas iniciales deben tener al menos 12 caracteres.
4. El mapping de los cuatro negocios demo fue revisado, aprobado y aplicado en Supabase; verificarlo de nuevo antes de repetir el backfill en otro entorno.
5. Pendiente operativo: desplegar el hardening local, rotar el secreto expuesto de n8n y validar en Production el acceso global de `ADMIN_USER_ID` y el aislamiento de una cuenta propietaria. Después retira `ADMIN_TOKEN`, `AI_TOKEN` y los IDs legacy cuando ningún flujo dependa de ellos.

La interfaz no incluye registro público ni recuperación de contraseña; las cuentas se aprovisionan desde el entorno de operación.
