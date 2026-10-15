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

`ensureTelarAIKnowledge()` crea entradas faltantes y actualiza contenido desactualizado por título. También limpia duplicados de las entradas oficiales cuando está aplicada la migración que añade `KnowledgeBase.isEditable`.

La pantalla `/ai/knowledge` permite crear, editar y borrar entradas personalizadas. Las entradas oficiales del sistema son de solo lectura. La API filtra cada lectura y mutación por el propietario del contexto AI.

## Límites

- La sincronización mantiene entradas personalizadas; no borra entradas personalizadas que ya no se usan.
- La interfaz y el endpoint nuevos requieren aplicar su migración en cada entorno.
- El runtime observado puede contener títulos históricos adicionales. El inventario exacto de producción queda ⚪ Por verificar.
- La KB es contexto factual; no debe sustituir al System Prompt.

Ver: [[Contexto]], [[Security Path]] y [[Pendientes AI]].
