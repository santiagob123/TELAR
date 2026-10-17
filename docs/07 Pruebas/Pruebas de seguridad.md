# Pruebas de seguridad

## Confirmado en pruebas previas

- [x] System prompt rechazado antes del provider.
- [x] Instrucciones internas rechazadas.
- [x] API key y variables de entorno rechazadas.
- [x] Código interno y configuración sensible rechazados.
- [x] Intento de ignorar instrucciones rechazado.
- [x] No se observó `provider_request` en las solicitudes sensibles cubiertas.

## Smoke local — 2026-10-16

- [x] Build de producción con Prisma, Next, lint y tipos.
- [x] `npm audit` completo: cero vulnerabilidades reportadas.
- [x] Inicio devuelve `200` y las cabeceras `nosniff`, `SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy` y HSTS.
- [x] Dashboard sin sesión devuelve `401`.
- [x] Login con origen externo devuelve `403`.
- [x] Mutación admin con cookie inválida y origen externo devuelve `403` antes de autenticar o consultar la base de datos.
- [x] Cookies legacy admin/AI aceptan una sesión vigente y rechazan una caducada usando secretos efímeros locales.

## Cobertura Production aún no acreditada

Los cambios aún no están desplegados. En un ambiente de prueba se debe comprobar:

- [ ] Una mutación con una sesión de usuario válida acepta el mismo origen y rechaza uno externo.
- [ ] Login y logout en Production rechazan solicitudes de origen externo.
- [ ] Las cookies legacy de admin y AI dejan de funcionar tras ocho horas en Production.
- [ ] Si la base de datos falla, el login responde con indisponibilidad y no cae a un contador por instancia.
- [ ] Los límites de intentos de login se mantienen entre instancias.
- [ ] Cabeceras de seguridad presentes en las respuestas de Production después del despliegue.
- [ ] Admin global y propietario ven únicamente el alcance esperado con dos cuentas y datos aislados.

La verificación runtime requiere desplegar los cambios y un ambiente de prueba con dos cuentas. La comprobación previa de Vercel con el token global valida acceso de administrador, no esas propiedades.

Los casos de variación lingüística e historial requieren una suite de regresión ejecutable contra los prompts/providers configurados; los resultados previos solo aplican a los casos enumerados arriba.
