# @mdevs/mai-server

Este módulo contiene los servicios backend, enrutadores tRPC, configuraciones de sistema y flujos de trabajo para la aplicación de servidor mAI.

## 📁 Estructura del Proyecto

- **`src/featureFlags`**: Gestión y evaluación de banderas de características (feature flags).
- **`src/globalConfig`**: Configuraciones globales del servidor.
- **`src/routers`**: Definición de enrutadores tRPC que exponen APIs seguras y tipadas al cliente.
- **`src/services`**: Servicios de infraestructura interna (ej. servicio de correo, bases de datos).
- **`src/workflows`**: Flujos de trabajo asíncronos y gestión de tareas con Upstash/QStash.

## 🚀 Desarrollo y Validación

Para realizar la comprobación de tipos TypeScript en el proyecto de servidor:

```bash
pnpm type-check
```
