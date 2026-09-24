# TELAR TAG - Arquitectura

## Flujo

```text
/admin/tags -> POST /api/tags -> createProfileAndTag()
Business -> DigitalProfile -> Tag
/tag/[identifier] -> Prisma -> página pública
/admin/profile -> GET/PATCH /api/profiles -> edición
/admin/profile -> PATCH /api/tags/[identifier] -> estado
```

## Modelo

- `Business` contiene datos del negocio.
- `DigitalProfile` tiene relación 1:1 con `Business`.
- `Tag` pertenece opcionalmente a `DigitalProfile`.
- `Tag.identifier` es único.
- `Tag.status` se valida como `active` o `inactive` en el servicio.

## Ownership

`User.businesses`, `Business.ownerId` y `Business.owner` existen en el schema, pero la aplicación todavía no filtra recursos por usuario.
