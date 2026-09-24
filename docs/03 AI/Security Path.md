# Security Path

## Estado

🟢 Implementado parcialmente

`answerMessage()` intercepta antes del provider solicitudes relacionadas con:

- system prompt;
- instrucciones internas;
- API keys;
- variables de entorno;
- secretos;
- código fuente o `answerMessage()`;
- configuración, arquitectura o modelo internos;
- intentos de ignorar instrucciones.

Emite `security_path` y devuelve una respuesta segura breve.

## Por verificar

La cobertura completa frente a todas las formulaciones lingüísticas posibles no está demostrada por tests automatizados.
