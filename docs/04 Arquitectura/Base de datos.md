# Base de datos

## Estado

🟡 En transición

El schema declara PostgreSQL con `DATABASE_URL` y `DIRECT_URL`.

Modelos principales:

- `User`;
- `Business`;
- `DigitalProfile`;
- `Tag`;
- `KnowledgeBase`;
- `Conversation`;
- `Message`.

Relaciones relevantes:

```text
User 1 -> N Business (ownerId nullable en schema)
Business 1 -> 1 DigitalProfile
DigitalProfile 1 -> N Tag
Business 1 -> N KnowledgeBase
Business 1 -> N Conversation
Conversation 1 -> N Message
```

La migración de `ownerId` existe, pero su ejecución en runtime está ⚪ Por verificar.
