# TELAR MVP

Proyecto MVP que contiene dos productos: TELAR TAG y TELAR AI.

Tecnologías:
- Next.js + TypeScript
- TailwindCSS
- Prisma + SQLite
- OpenAI (opcional, modo demo si no hay clave)

Instalación:

1. Copiar variables de entorno:

```bash
cp .env.example .env
```

2. Instalar dependencias:

```bash
npm install
```

3. Generar Prisma y migrar:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

4. Ejecutar en desarrollo:

```bash
npm run dev
```

Cómo probar:
- TAG: Abrir http://localhost:3000/tag/demo123 (seed crea `demo123`).
- Simulador NFC: http://localhost:3000/tag/simulate
- Admin: http://localhost:3000/admin → crear perfiles y tags.
- AI: Usar el simulador POST http://localhost:3000/api/ai/message con JSON { businessId, from, text } o usar la UI en `/admin/conversations`.

Modo DEMO:
- Si `OPENAI_API_KEY` no está definida, el servicio AI caerá en modo demo con respuestas simples.
- `WHATSAPP_MODE=demo` usa el simulador interno.

Seguridad / Admin:
- Puedes definir `ADMIN_TOKEN` en `.env` para proteger las rutas bajo `/admin`.
- En ese caso, añade la cabecera `x-admin-token` con el valor a tus peticiones o usa herramientas que permitan añadir cabeceras.

Pendiente:
- Autenticación admin más robusta.
- Webhook real de WhatsApp Cloud API.
- UI más completa y edición de perfiles.
