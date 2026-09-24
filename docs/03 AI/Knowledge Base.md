# Knowledge Base

## Estado

🟢 Implementada parcialmente

La KB oficial se declara como `TELAR_AI_KNOWLEDGE` en `services/ai/knowledge.ts` e incluye bloques sobre:

- qué es TELAR;
- TELAR TAG;
- TELAR AI;
- capacidades;
- canales;
- limitaciones;
- información no confirmada.

`ensureTelarAIKnowledge()` crea entradas faltantes y actualiza contenido desactualizado por título.

## Límites

- La sincronización no elimina automáticamente entradas antiguas o duplicadas.
- El runtime observado puede contener títulos históricos adicionales. El inventario exacto de producción queda ⚪ Por verificar.
- La KB es contexto factual; no debe sustituir al System Prompt.

Ver: [[Contexto]], [[Security Path]] y [[Pendientes AI]].
