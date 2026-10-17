# MVP - TELAR TAG

## Estado

🟢 Implementado; NFC físico pendiente.

TELAR TAG permite crear negocios con perfil digital y TAG, editar información pública, activar/desactivar TAGs y mostrar una página pública por identificador.

## Confirmado en código

- Creación transaccional de `Business`, `DigitalProfile` y `Tag`.
- Identificadores únicos generados con `nanoid` o introducidos por el administrador.
- Estados `active` e `inactive`.
- Validación de teléfono, correo, URLs y redes sociales.
- Página pública en `/tag/[id]`.
- Generación de QR en el panel.

## Limitaciones

- Existe login individual por propietario; el `ADMIN_TOKEN` global continúa temporalmente para compatibilidad administrativa.
- Las APIs privadas aplican ownership mediante `ADMIN_USER_ID` y `Business.ownerId`.
- Los cuatro negocios históricos aprobados fueron asignados en la instancia Supabase configurada; revisar otros entornos antes de habilitarlos.

## Funcionalidad pendiente

- NFC físico/hardware real. Existe un simulador NFC, pero no integración con hardware NFC real.

Ver: [[TELAR TAG - Estado]], [[Seguridad TAG]], [[Pendientes TAG]].
