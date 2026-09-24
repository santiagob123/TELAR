# Arquitectura general

## Stack confirmado

- Next.js 13.5.9 con Pages Router.
- React 18.
- TypeScript.
- TailwindCSS.
- Prisma Client.
- PostgreSQL declarado en `schema.prisma`.

## Capas

```text
pages / components
  -> pages/api
  -> services
  -> Prisma
  -> base de datos
```

AI añade una capa de contexto, KB, historial, rutas deterministas y provider.

La configuración activa y las migraciones usan PostgreSQL. La documentación histórica que mencionaba SQLite debe considerarse obsoleta.
