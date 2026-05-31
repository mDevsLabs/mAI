# 🤯 Aplicación de Escritorio mAI

mAI Desktop es una aplicación de escritorio multiplataforma para [mAI](https://github.com/mDevsLabs/mAI), desarrollada con Electron, que ofrece una experiencia y funcionalidades de escritorio nativas.

## ✨ Características

- **🌍 Soporte Multiplataforma**: Compatible con sistemas macOS (Intel/Apple Silicon), Windows y Linux.
- **🔄 Actualizaciones Automáticas**: Mecanismo integrado que garantiza contar siempre con la última versión.
- **🌐 Soporte Multilingüe**: Soporte completo de i18n para más de 18 idiomas con carga diferida.
- **🎨 Integración Nativa**: Profunda integración con el sistema operativo mediante menús nativos, atajos de teclado y notificaciones.
- **🔒 Seguro y Confiable**: Notarizado en macOS, almacenamiento encriptado de claves, flujo OAuth seguro.
- **📦 Canales de Lanzamiento Múltiples**: Versiones estable, beta y nightly builds.
- **⚡ Gestión Avanzada de Ventanas**: Arquitectura multi-ventana con sincronización automática de temas.
- **🔗 Sincronización con Servidor Remoto**: Sincronización segura de datos con instancias mAI remotas.
- **🎯 Herramientas de Desarrollo**: Panel de desarrollo integrado y herramientas completas de depuración.

## 🚀 Configuración para Desarrollo

### Requisitos Previos

- **Node.js** 22+
- **pnpm** 10+
- Entorno de desarrollo compatible con **Electron**

### Inicio Rápido

```bash
# Instalar dependencias
pnpm install-isolated

# Iniciar servidor de desarrollo
pnpm dev

# Comprobación de tipos
pnpm type-check

# Ejecutar pruebas
pnpm test
```

### Configuración del Entorno

Copie el archivo `.env.desktop` como `.env` y configúrelo según sea necesario:

```bash
cp .env.desktop .env
```

> [!WARNING]
> Realice una copia de seguridad de su archivo `.env` antes de realizar cambios para evitar perder configuraciones.

### Comandos de Compilación

| Comando                    | Descripción                                                 |
| -------------------------- | ----------------------------------------------------------- |
| `pnpm build:main`          | Compilar proceso principal y preload (solo salida dist)     |
| `pnpm package:mac`         | Empaquetar para macOS (Intel + Apple Silicon)               |
| `pnpm package:win`         | Empaquetar para Windows                                     |
| `pnpm package:linux`       | Empaquetar para Linux                                       |
| `pnpm package:local`       | Build de empaquetado local (sin ASAR)                       |
| `pnpm package:local:reuse` | Build de empaquetado local reutilizando la carpeta dist     |

### Flujo de Trabajo de Desarrollo

```bash
# 1. Desarrollo
pnpm dev # Iniciar con recarga en caliente (hot reload)

# 2. Calidad del Código
pnpm lint       # Verificación con ESLint
pnpm format     # Formateo con Prettier
pnpm type-check # Validación de tipos con TypeScript

# 3. Pruebas
pnpm test # Ejecutar pruebas de Vitest
```

## 🎯 Canales de Lanzamiento

| Canal       | Descripción                                       | Estabilidad | Actualizaciones automáticas |
| ----------- | ------------------------------------------------- | ----------- | --------------------------- |
| **Stable**  | Versiones minuciosamente probadas                 | 🟢 Alta     | ✅ Sí                       |
| **Beta**    | Versiones previas con nuevas características      | 🟡 Media    | ✅ Sí                       |
| **Nightly** | Compilaciones diarias con los últimos cambios     | 🟠 Baja     | ✅ Sí                       |

## 🛠 Stack Tecnológico

- **Electron** `37.1.0` - Framework de escritorio multiplataforma
- **Node.js** `22+` - Runtime del backend
- **TypeScript** `5.7+` - Desarrollo typado seguro
- **Vite** `6.2+` - Herramienta de compilación

## 🏗 Arquitectura

La aplicación de escritorio utiliza una arquitectura avanzada de inyección de dependencias y comunicación basada en eventos.

### 📁 Estructura Principal

```
src/main/core/
├── App.ts                    # 🎯 Orquestador principal de la aplicación
├── IoCContainer.ts           # 🔌 Contenedor de inyección de dependencias
├── window/                   # 🪟 Módulos de gestión de ventanas
│   ├── WindowThemeManager.ts     # 🎨 Sincronización de temas
│   ├── WindowPositionManager.ts  # 📐 Persistencia de la posición
│   ├── WindowErrorHandler.ts     # ⚠️  Gestión de errores
│   └── WindowConfigBuilder.ts    # ⚙️  Generador de configuración
└── infrastructure/           # 🔧 Services de infraestructura
    ├── StoreManager.ts          # 💾 Almacenamiento de configuración
    ├── I18nManager.ts           # 🌍 Internacionalización
    └── StaticFileServerManager.ts # 🗂️ Servidor de archivos locales
```

## 🔒 Seguridad

- **Flujo OAuth 2.0** con PKCE para intercambio seguro de tokens.
- **Almacenamiento encriptado de tokens** mediante la API nativa de almacenamiento seguro del sistema operativo.
- **Firma de código y notarización** para macOS, asegurando que la app no contenga software malicioso.
