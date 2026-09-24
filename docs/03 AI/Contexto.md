# Contexto

## Estado

🟢 Implementado

`services/ai/context.ts` busca un Business llamado `TELAR AI` que no tenga `DigitalProfile`. Esto separa el contexto técnico AI de negocios TAG con perfil digital.

Si no existe, crea el Business técnico y carga la KB oficial. Si faltan bloques o están desactualizados, sincroniza contenido por título.

## Observación

La migración de `ownerId` está aplicada en la base de desarrollo. El contexto AI actualmente no usa ownership para resolver el Business técnico; la aplicación de ownership a recursos sigue pendiente.
