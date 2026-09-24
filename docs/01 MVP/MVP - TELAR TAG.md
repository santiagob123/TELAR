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

- La administración usa `ADMIN_TOKEN` global.
- No hay ownership runtime por usuario.
- La migración de `Business.ownerId` está aplicada en la base de desarrollo, pero el ownership todavía no se aplica a las APIs.

## Funcionalidad pendiente

- NFC físico/hardware real. Existe un simulador NFC, pero no integración con hardware NFC real.

Ver: [[TELAR TAG - Estado]], [[Seguridad TAG]], [[Pendientes TAG]].
