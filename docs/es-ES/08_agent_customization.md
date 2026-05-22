# Personalización de Agentes ⚙️

Ajustar en detalle los agentes en **mAI** le permite modificar profundamente su comportamiento, estilo de respuesta y las herramientas a las que pueden acceder.

## Configuración Básica

Para cada agente, puede configurar:
- **Instrucción del Sistema (System Prompt)**: Las instrucciones fundamentales que definen la personalidad, las reglas y el rol del agente. Esta es la configuración con mayor influencia en las respuestas del agente.
- **Modelo de Lenguaje**: Seleccione el LLM por defecto a utilizar (por ejemplo, GPT-4o, Claude 3.5 Sonnet, Llama 3).

## Configuración Avanzada

También puede modificar los hiperparámetros de generación:
- **Temperatura**: Controla la creatividad de las respuestas. Una temperatura más baja (por ejemplo, 0.2) produce respuestas más factuales y deterministas. Una temperatura más alta (por ejemplo, 0.9) fomenta la creatividad.
- **Top P**: Otro método para controlar la diversidad de las respuestas.
- **Penalización de Presencia / Frecuencia**: Anima o desanima al agente a repetir las mismas palabras o a desviarse de los temas discutidos.
- **Máximo de Tokens**: Limita la longitud máxima de la respuesta generada.
