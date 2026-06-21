# @mdevs/mai-cli

Interfaccia a riga di comando (CLI) di mAI.

## Sviluppo Locale

| Attività | Comando |
| --- | --- |
| Esegui in modalità dev | `bun run dev -- <comando>` |
| Build della CLI | `bun run build` |
| Collega `mai` nella shell | `bun run cli:link` |
| Rimuovi il collegamento globale | `bun run cli:unlink` |

- `bun run build` genera solo `dist/index.js`.
- Per rendere `mai` disponibile nella shell, esegui `bun run cli:link`.
- Dopo il collegamento, se la shell continua a non trovare `mai`, esegui `rehash` in `zsh`.

## URL del Server Personalizzato

Per impostazione predefinita, la CLI si connette a `https://mai-officiel.vercel.app`. Per puntare a un server diverso (ad es. un'istanza locale):

| Metodo | Comando | Persistenza |
| --- | --- | --- |
| Variable d'ambiente | `MAI_SERVER=http://localhost:4000 bun run dev -- <comando>` | Solo comando corrente |
| Flag di accesso | `mai login --server http://localhost:4000` | Salvato in `~/.mai/settings.json` |

Priorità: var d'ambiente `MAI_SERVER` > `settings.json` > URL ufficiale predefinito.
