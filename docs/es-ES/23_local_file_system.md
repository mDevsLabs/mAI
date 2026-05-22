# Sistema de Archivos Local 📂

La aplicación de escritorio **mAI** presenta una integración profunda con el sistema de archivos de su sistema operativo, lo que le permite acceder y analizar sus archivos locales de forma segura.

## Lectura y Análisis de Archivos

Puede enviar archivos directamente a sus agentes (como **May**) para su análisis o procesamiento:
- **Arrastrar y Soltar**: Arrastre un documento de texto, archivo PDF, hoja de cálculo de Excel o imagen directamente al área de chat de mAI.
- **Adjunto**: Haga clic en el icono del clip en el chat para navegar por su explorador de archivos.
- Los archivos se analizan y procesan localmente, y solo el texto extraído (o la imagen en sí para modelos multimodales) se envía al LLM.

## Límites de Seguridad

Para mantener su sistema seguro:
- mAI nunca lee archivos sin su acción explícita (arrastrar y soltar o selección manual de archivos).
- Puede especificar un directorio dedicado en la configuración general para restringir el acceso de mAI únicamente a esa carpeta.
