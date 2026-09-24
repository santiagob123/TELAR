# WhatsApp

## Estado

🔴 Pendiente

`services/whatsapp/index.ts` solo expone `MODE` desde `WHATSAPP_MODE` y reexporta `handleIncoming`. Existe preparación/modo demo y reutilización del núcleo de conversación, pero eso no constituye una integración real con WhatsApp.

No se confirmó un webhook real de WhatsApp Cloud API en el código revisado.
