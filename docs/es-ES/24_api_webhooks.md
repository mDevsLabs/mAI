# API y Webhooks 🔗

**mAI** proporciona interfaces programáticas para permitir integraciones externas con sus propias aplicaciones, servicios web o scripts de automatización.

## API Local (HTTP)

La aplicación de escritorio mAI puede ejecutar un servidor web local seguro en un puerto designado. Este servidor expone varios puntos de acceso (endpoints):
- `POST /api/chat`: Envía un mensaje a un agente específico y devuelve una respuesta estructurada (admite formato estándar o de transmisión/streaming).
- `GET /api/agents`: Enumera todos los agentes disponibles y sus configuraciones.
- `POST /api/agents`: Permite crear un nuevo agente mediante programación.

## Integración de Webhooks

Puede configurar webhooks de salida en los ajustes avanzados de mAI. Un webhook envía automáticamente una carga útil JSON a una URL externa cuando ocurren eventos específicos:
- **Mensaje de chat completado**: Se activa tan pronto como un agente termina de generar una respuesta.
- **Agente creado**: Se activa cuando se añade un nuevo perfil de agente.
- **Error del sistema**: Se activa durante problemas de validación de claves API o interrupciones del proveedor de LLM.
