# @lobehub/cli

Interface en ligne de commande (CLI) mAI.

## Développement Local

| Tâche | Commande |
| --- | --- |
| Lancer en mode dev | `bun run dev -- <command>` |
| Build le CLI | `bun run build` |
| Lier `lh`/`lobe`/`lobehub` à votre terminal | `bun run cli:link` |
| Supprimer le lien global | `bun run cli:unlink` |

- `bun run build` génère uniquement `dist/index.js`.
- Pour rendre `lh` disponible dans votre terminal, lancez `bun run cli:link`.
- Après avoir créé le lien, si votre terminal ne trouve toujours pas `lh`, lancez `rehash` dans `zsh`.

## URL Serveur Personnalisée

Par défaut, le CLI se connecte à `https://app.lobehub.com`. Pour le faire pointer vers un serveur différent (par ex. une instance locale) :

| Méthode | Commande | Persistance |
| --- | --- | --- |
| Variable d'environnement | `LOBEHUB_SERVER=http://localhost:4000 bun run dev -- <command>` | Commande en cours uniquement |
| Option de connexion | `lh login --server http://localhost:4000` | Sauvegardé dans `~/.lobehub/settings.json` |

Priorité : Variable d'env `LOBEHUB_SERVER` > `settings.json` > URL officielle par défaut.

## Auto-complétion de Terminal

### Installer l'auto-complétion pour un CLI lié

| Terminal | Commande |
| --- | --- |
| `zsh` | `source <(lh completion zsh)` |
| `bash` | `source <(lh completion bash)` |

### Utiliser l'auto-complétion pendant le développement local

| Terminal | Commande |
| --- | --- |
| `zsh` | `source <(bun src/index.ts completion zsh)` |
| `bash` | `source <(bun src/index.ts completion bash)` |

- L'auto-complétion dépend du contexte. Par exemple, `lh agent <Tab>` affiche les sous-commandes de l'agent au lieu des commandes principales.
- Si vous mettez à jour la logique d'auto-complétion localement, réexécutez la commande `source <(...)` correspondante pour recharger la configuration.
- L'auto-complétion enregistre uniquement les fonctions shell. Elle n'installe pas le binaire `lh` en lui-même.

## Vérification Rapide

```bash
which lh
lh --help
lh agent <TAB>
```
