# @lobehub/cli

Interfaccia a riga di comando (CLI) di mAI.

## Sviluppo Locale

| Attività | Comando |
| --- | --- |
| Esegui in modalità dev | `bun run dev -- <comando>` |
| Build della CLI | `bun run build` |
| Collega `lh`/`lobe`/`lobehub` nella shell | `bun run cli:link` |
| Rimuovi il collegamento globale | `bun run cli:unlink` |

- `bun run build` genera solo `dist/index.js`.
- Per rendere `lh` disponibile nella shell, esegui `bun run cli:link`.
- Dopo il collegamento, se la shell continua a non trovare `lh`, esegui `rehash` in `zsh`.

## URL del Server Personalizzato

Per impostazione predefinita, la CLI si connette a `https://app.lobehub.com`. Per puntare a un server diverso (ad es. un'istanza locale):

| Metodo | Comando | Persistenza |
| --- | --- | --- |
| Variable d'ambiente | `LOBEHUB_SERVER=http://localhost:4000 bun run dev -- <comando>` | Solo comando corrente |
| Flag di accesso | `lh login --server http://localhost:4000` | Salvato in `~/.lobehub/settings.json` |

Priorità: var d'ambiente `LOBEHUB_SERVER` > `settings.json` > URL ufficiale predefinito.
