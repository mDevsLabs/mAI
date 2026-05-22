# Privacidad y Seguridad 🔒

La seguridad de los datos y el respeto por su privacidad son principios fundamentales en el diseño de **mAI**.

## Almacenamiento Local Cifrado

Todos sus datos sensibles se almacenan localmente en su dispositivo:
- **Claves API**: Se cifran utilizando algoritmos estándar del sector antes de guardarse en su almacenamiento local. Sus claves API nunca se envían a nuestros servidores; se envían directamente desde su dispositivo a los servidores del proveedor de LLM respectivo.
- **Historial de Chat**: Sus conversaciones permanecen en su máquina (a menos que habilite explícitamente la sincronización segura en la nube).

## Conexiones Seguras

Todas las solicitudes salientes a las API de modelos de lenguaje utilizan protocolos de comunicación seguros (HTTPS / SSL), lo que garantiza que los datos intercambiados no puedan ser interceptados en la red.

## Prácticas Recomendadas para Empresas

Para obtener el nivel más alto de seguridad en entornos empresariales:
- Utilice modelos alojados localmente a través de **Ollama** o un servidor de inferencia privado (lo que significa que ningún dato sale de la red corporativa).
- Desactive la telemetría anónima en la pestaña de configuración general.
