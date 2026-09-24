# TELAR TAG - Estado

## Estado

🟢 Implementado; NFC físico pendiente.

## Implementado y confirmado

- Creación de negocio, perfil digital y TAG en `services/tag/index.ts`.
- Página pública por `/tag/[id]`.
- TAG `active` muestra el perfil; TAG `inactive` muestra un aviso y no expone el perfil completo.
- Edición administrativa de perfil y datos del negocio.
- Cambio de estado del TAG.
- QR generado en `components/TagQr.tsx`.

## Parcial

- Autenticación administrativa mediante `ADMIN_TOKEN`.
- Ownership declarado en Prisma, pero no aplicado a queries ni APIs.

## Por verificar

## Funcionalidad pendiente

- NFC físico/hardware real; el simulador existe, pero no hay integración NFC real.

## Hardening

- Ownership declarado en Prisma, pero todavía no aplicado a queries ni APIs.
- Autenticación administrativa mediante `ADMIN_TOKEN` global.

Ver: [[TELAR TAG - Arquitectura]] y [[Seguridad TAG]].
