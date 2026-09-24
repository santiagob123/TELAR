# QR

## Estado

🟢 Implementado

`components/TagQr.tsx` genera un Data URL mediante `qrcode` cuando el panel abre el componente.

## Funciones confirmadas

- Construcción de URL `${origin}/tag/{identifier}`.
- Generación de imagen QR de 320 px.
- Copia de URL mediante Clipboard API.
- Descarga de PNG.
- Mensajes de error si falla la generación o copia.

## Por verificar

- Prueba de lectura en dispositivos físicos.
- Comportamiento cuando el dominio de producción no está configurado.
