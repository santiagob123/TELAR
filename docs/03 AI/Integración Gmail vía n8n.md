# Integración Gmail vía n8n

## Resumen

Canal externo activo, **one-way**. Vive en una instancia de n8n, no en el repositorio TELAR. Clasifica correos entrantes de Gmail, aplica reglas deterministas de prioridad y categoría, etiqueta y ejecuta acciones automáticas (archivar / marcar importante).

**Estado:** PARCIAL
**Prioridad:** P1
**Bloqueo:** requiere acceso a la instancia n8n para cambiar y exportar el workflow

## Flujo del workflow

Gmail Trigger → obtener mensaje completo → verificar duplicado (etiqueta `TELAR/Procesado`) → TELAR AI `/classify` → normalizar respuesta → reglas de prioridad y categoría → resolver etiqueta → etiquetar por categoría → evaluar acción → decidir acción automática → ejecutar acción (archivar / marcar importante) → marcar como procesado.

## Nodos principales

- **Gmail Trigger** — dispara cada minuto para correos no leídos.
- **Gmail - Obtener mensaje completo** — extrae id, threadId, subject, from, text/html.
- **Verificar duplicado** — comprueba etiqueta `TELAR/Procesado` para evitar reprocesar.
- **Extraer / normalizar correo** — trunca a 2000 caracteres y limpia HTML de fallback.
- **TELAR AI - Classify** — llama al endpoint `/api/integrations/n8n/classify` de TELAR con header `x-n8n-secret`. Debe enviar `externalId` con el ID estable del correo para actualizar la misma clasificación cuando n8n reintente.
- **Normalizar respuesta de clasificación** — valida que venga categoría; si falta, marca `clasificacion_fallida`.
- **Reglas de prioridad y categoría** — determinista. Aplica señales por categoría (empleo, seguridad, factura, suscripción, red social, trabajo, promoción, spam) con umbrales mínimos, puntaje de prioridad, remitentes prioritarios y fallback de seguridad.
- **Resolver etiqueta** — mapea la categoría final a `TELAR/<Categoría>`, crea la etiqueta si no existe.
- **Gmail - Etiquetar** — aplica la etiqueta correspondiente al correo.
- **Evaluar acción** — deriva `accion_final` (`revisar`, `archivar`, `guardar`, `responder_pendiente`, `ninguna`) y `nivel_atencion`.
- **Decidir acción automática** — reglas duras: promoción/suscripción/red social con prioridad baja → archivar; trabajo/seguridad/factura con prioridad alta → marcar importante.
- **Gmail - Archivar / Marcar importante** — ejecuta la acción.
- **Gmail - Marcar procesado** — aplica `TELAR/Procesado` para evitar reproceso.

## Problemas detectados

1. **P0 SEGURIDAD:** el header `x-n8n-secret` está hardcodeado en el nodo HTTP `TELAR AI - Classify`. Debe rotarse y moverse a **credentials** de n8n. Es una deuda de configuración manual, no de código del repo TELAR.

2. **Duplicación de nodos Gmail:** existe `Gmail - Obtener etiquetas1` y `Gmail - Obtener etiquetas (Dedup)`. Revisar si ambos son necesarios o consolidar en uno.

3. **`retryOnFail: false` en nodos Gmail críticos:** un fallo transitorio de la API Gmail descarta el correo sin reintento.

4. **`onError` faltantes:** algunos nodos Gmail no tienen rama de error configurada. Los fallos pueden ser silenciosos.

5. **Persistencia implementada en backend:** TELAR guarda categoría, prioridad, resumen y acción sin guardar el cuerpo completo del correo. La migración está aplicada en la instancia Supabase configurada; el workflow debe enviar `externalId` para deduplicar.

6. **Workflow no versionado:** el JSON vive únicamente en la instancia n8n. No hay revisión, diff, ni respaldo en el repo.
7. **Chat n8n:** TELAR admite `Idempotency-Key` estable por mensaje y devuelve la respuesta guardada ante reintentos. El workflow externo aún debe enviar ese header. La migración ya está aplicada en la instancia Supabase configurada.

## Próximos pasos

Cuando esté disponible el acceso a n8n:

1. Rotar `x-n8n-secret` y moverlo a credentials seguras.
2. Enviar `externalId` estable a clasificación e `Idempotency-Key` estable al chat.
3. Revisar nodos duplicados, reintentos, `onError` y métricas básicas.
4. Exportar/versionar workflow sin secretos ni datos privados.

## Relación con otros documentos

- `CONTEXT.md` — sección "Integraciones externas".
- `docs/AUDIT.md` — filas "Gmail vía n8n" y "Rotar y asegurar x-n8n-secret".
- `docs/PENDIENTES.md` — persistencia, idempotencia, versionado y P0 de seguridad.
