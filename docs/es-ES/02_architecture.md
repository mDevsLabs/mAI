# Arquitectura de la aplicación 🏗️

La arquitectura de **mAI** está diseñada para ser modular, extensible y extremadamente eficiente. Se basa en tecnologías web modernas y en un sistema flexible.

## Componentes de la arquitectura

- **Frontend**: Desarrollado con **Next.js** y **React**. La interfaz de usuario utiliza patrones de diseño modernos y responsivos para garantizar una experiencia fluida en escritorio y dispositivos móviles.
- **Gestión de estado del cliente**: Gestionado con **Zustand**, lo que permite una sincronización de estado reactiva y ligera.
- **Capa de base de datos**: Utiliza **Drizzle ORM** para la comunicación con la base de datos (SQLite local para escritorio, PostgreSQL opcional para sincronización en la nube).
- **Integración de LLM**: Una capa de API modular que estandariza y transmite las solicitudes a diferentes proveedores (OpenAI, Anthropic, Gemini, Ollama).
