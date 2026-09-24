# Decisiones técnicas

## Confirmadas por el código

- Next.js Pages Router.
- Prisma como capa de persistencia.
- Business técnico separado para TELAR AI mediante nombre y ausencia de perfil.
- Fast-path y security-path antes del provider.
- Historial reciente limitado a seis mensajes.
- `ADMIN_TOKEN` y `AI_TOKEN` separados.

## Decisiones documentadas, no necesariamente finales

- La Knowledge Base se trata como contexto factual, no como instrucciones.
- WhatsApp real no se presenta como implementado.
- El ownership se modela con `Business.ownerId` nullable en Fase 1.

## Por confirmar

- Base de datos objetivo definitiva, porque README y schema discrepan.
- Estrategia de sesión multiusuario.
- Política de asignación de Business sin owner.
- Canal real prioritario después del MVP.
