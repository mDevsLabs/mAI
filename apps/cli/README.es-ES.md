# @mdevs/mai-cli

Interfaz de línea de comandos (CLI) de mAI.

## Desarrollo Local

| Tarea | Comando |
| --- | --- |
| Ejecutar en modo dev | `bun run dev -- <comando>` |
| Compilar el CLI | `bun run build` |
| Enlazar `mai` a su terminal | `bun run cli:link` |
| Eliminar el enlace global | `bun run cli:unlink` |

- `bun run build` solo genera `dist/index.js`.
- Para hacer que `mai` esté disponible en su terminal, ejecute `bun run cli:link`.
- Después de enlazar, si su terminal aún no encuentra `mai`, ejecute `rehash` en `zsh`.

## URL de Servidor Personalizada

Por defecto, el CLI se conecta a `https://mai-officiel.vercel.app`. Para apuntarlo a un servidor diferente (por ejemplo, una instancia local):

| Método | Comando | Persistencia |
| --- | --- | --- |
| Variable de entorno | `MAI_SERVER=http://localhost:4000 bun run dev -- <comando>` | Solo el comando actual |
| Flag de inicio de sesión | `mai login --server http://localhost:4000` | Guardado en `~/.mai/settings.json` |

Prioridad: Variable de entorno `MAI_SERVER` > `settings.json` > URL oficial por defecto.
