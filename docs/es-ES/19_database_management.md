# Gestión de Bases de Datos 🗄️

**mAI** gestiona el almacenamiento de sus datos de manera estructurada y altamente eficiente para garantizar un acceso rápido y sin conexión a sus conversaciones y configuraciones.

## Arquitectura de Almacenamiento

Según el entorno de ejecución (Escritorio o Web), mAI utiliza diferentes motores de almacenamiento:
- **Aplicación de Escritorio**: Utiliza una base de datos local ligera (SQLite) almacenada en el directorio de usuario de la aplicación. Garantiza un rendimiento de lectura/escritura excelente para grandes volúmenes de historial.
- **Aplicación Web**: Se basa en la base de datos interna del navegador (IndexedDB) o en servicios API externos sincronizados con una base de datos PostgreSQL si el modo en la nube está activado.

## Migraciones de Esquema

mAI incluye un sistema automático de migración del esquema de la base de datos. Con cada actualización de la aplicación, si la estructura de la base de datos cambia (por ejemplo, al añadir un nuevo campo a los agentes o mensajes), las migraciones se ejecutan de forma transparente al inicio sin alterar sus datos existentes.

## Optimización de Rendimiento

Para mantener la aplicación rápida:
- **Limpieza Automática**: Los mensajes temporales o las sesiones expiradas se pueden purgar periódicamente.
- **Indexación**: Los mensajes de las conversaciones están indexados para permitir una búsqueda de texto casi instantánea.
