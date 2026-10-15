# Contexto

## Estado

🟢 Implementado

`services/ai/context.ts` busca un Business llamado `TELAR AI` que no tenga `DigitalProfile`. Esto separa el contexto técnico AI de negocios TAG con perfil digital.

Si no existe, crea el Business técnico y carga la KB oficial. Si faltan bloques o están desactualizados, sincroniza contenido por título.

## Observación

El contexto AI privado resuelve el Business técnico usando el `User` de `AI_USER_ID`. Si encuentra un contexto técnico sin propietario, lo asigna al principal AI configurado; un contexto perteneciente a otro propietario se rechaza.
