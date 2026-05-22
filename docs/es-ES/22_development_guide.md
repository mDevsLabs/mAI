# Guía de Desarrollo 🛠️

Esta guía proporciona instrucciones básicas para los desarrolladores que deseen contribuir al proyecto **mAI** o ejecutar el código fuente en modo de desarrollo.

## Estructura del Proyecto

mAI está estructurado como un monorepo moderno (que utiliza pnpm y Turborepo):
- `apps/web`: La aplicación principal Next.js.
- `packages/`: Módulos compartidos y configuraciones reutilizables (componentes de interfaz de usuario, tipos, ayudantes).

## Ejecución en Modo de Desarrollo

1. **Requisitos previos**: Asegúrese de tener instalado Node.js (se recomienda versión LTS) y pnpm o bun.
2. **Instalar dependencias**:
   ```bash
   pnpm install
   ```
3. **Iniciar el servidor de desarrollo**:
   ```bash
   pnpm run dev
   ```
   La aplicación estará accesible localmente en `http://localhost:3000`.

## Pruebas (Testing)

Utilizamos **Vitest** para nuestras suites de pruebas:
- Ejecutar pruebas una vez: `pnpm run test`
- Ejecutar pruebas en modo de observación (watch): `pnpm run test:watch`

Asegúrese de que todas las pruebas pasen con éxito antes de enviar cualquier modificación.
