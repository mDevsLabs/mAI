# Modelos de Lenguaje Soportados 🧠

**mAI** es una interfaz agnóstica de modelos. Soporta una amplia variedad de proveedores de inteligencia artificial comerciales en la nube y de código abierto locales.

## Principales Proveedores en la Nube

Puede configurar los siguientes proveedores en la nube introduciendo su clave API personal:
- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5, etc.
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku.
- **Google Gemini**: Gemini 1.5 Pro, Gemini 1.5 Flash.
- **Mistral AI**: Mistral Large, Mistral Medium, Codestral.
- **Groq**: Acceso ultrarrápido a modelos de código abierto como Llama 3 y Mixtral.

## Integración de Modelos Locales

Para los usuarios preocupados por la privacidad total de sus datos, mAI soporta completamente la ejecución local:
- **Ollama**: Integración nativa simplificada. Ejecute Ollama en segundo plano y mAI detectará automáticamente sus modelos instalados localmente (como Llama 3, Mistral o Phi-3).
- **API compatibles con OpenAI**: Conecte cualquier servidor de inferencia local o remoto (como LocalAI o LM Studio) especificando una URL base de API personalizada.
