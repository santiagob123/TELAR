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

- El login individual por propietario está implementado/desplegado; el token global de compatibilidad sigue disponible temporalmente.
- Las APIs privadas aplican ownership por `Business.ownerId`; falta validar el aislamiento de una sesión individual en Production.

## Por verificar

## Funcionalidad pendiente

- NFC físico/hardware real; el simulador existe, pero no hay integración NFC real.

## Hardening

- Los cuatro negocios históricos aprobados se asignaron en la instancia Supabase configurada; repetir revisión en otros entornos.
- Retirar el token global después de validar login individual y transición de propietarios.

Ver: [[TELAR TAG - Arquitectura]] y [[Seguridad TAG]].
