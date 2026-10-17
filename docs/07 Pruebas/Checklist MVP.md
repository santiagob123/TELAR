# Checklist MVP

## Producto

- [x] TAG público por identificador.
- [x] Perfil digital y datos públicos.
- [x] QR en panel.
- [x] Chat público AI.
- [x] Panel interno AI.
- [x] Persistencia de conversaciones e historial backend.
- [x] Exportación JSON administrativa con filtros de fecha.
- [x] Exportación CSV e impresión/guardar PDF mediante el navegador.
- [ ] WhatsApp real.
- [ ] NFC físico real.
- [x] Ownership multiusuario aplicado en código; login individual desplegado.

## Calidad

- [x] Validación TypeScript ejecutada previamente.
- [x] Validación Prisma ejecutada previamente.
- [x] Pruebas automatizadas simuladas de ownership (`npm run test:ownership`).
- [x] Build de producción local completado el 2026-10-16 con Next.js 15.5.28; Vercel Production continúa en `8c5c678` hasta desplegar los cambios locales.

## Seguridad

- [x] Fast-path y security-path existentes.
- [x] Cookies administrativas con atributos de protección.
- [x] Identidad individual implementada y desplegada; verificar el flujo con cuenta propietaria en Production.
- [x] Autorización por recurso implementada; falta ampliar la prueba runtime/E2E.
- [x] Rate limiting implementado y desplegado; falta verificar los límites en cada entorno.
- [x] Audit completo de dependencias sin vulnerabilidades tras migrar a Tailwind CSS 4.3.3.
- [x] Smoke local de cabeceras, rechazo de origen cruzado y expiración de cookies; validar en Production después de desplegar.

## Alcance de la evidencia

Las pruebas existentes de ownership simulan Prisma y no son E2E. La comprobación del token de compatibilidad en Vercel tampoco ejercita login individual. Una ejecución E2E requiere staging/cuentas/datos aislados y configuración de providers; esa verificación se coordina cuando estén disponibles esos recursos.
