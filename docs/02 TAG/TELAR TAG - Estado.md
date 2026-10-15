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
- El ownership se aplica a las APIs privadas mediante `ADMIN_USER_ID` y `Business.ownerId`.

## Por verificar

## Funcionalidad pendiente

- NFC físico/hardware real; el simulador existe, pero no hay integración NFC real.

## Hardening

- Los negocios históricos sin propietario deben asignarse mediante una operación controlada antes de usarlos desde el panel.
- La autenticación continúa basada en un token global; todavía no existe login multiusuario.

Ver: [[TELAR TAG - Arquitectura]] y [[Seguridad TAG]].
