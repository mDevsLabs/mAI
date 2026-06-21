# @mdevs/mai-cli

Interface en ligne de commande (CLI) mAI.

## Développement Local

| Tâche | Commande |
| --- | --- |
| Lancer en mode dev | `bun run dev -- <command>` |
| Build le CLI | `bun run build` |
| Lier `mai` à votre terminal | `bun run cli:link` |
| Supprimer le lien global | `bun run cli:unlink` |

- `bun run build` génère uniquement `dist/index.js`.
- Pour rendre `mai` disponible dans votre terminal, lancez `bun run cli:link`.
- Après avoir créé le lien, si votre terminal ne trouve toujours pas `mai`, lancez `rehash` dans `zsh`.

## URL Serveur Personnalisée

Par défaut, le CLI se connecte à `https://mai-officiel.vercel.app`. Pour le faire pointer vers un serveur différent (par ex. une instance locale) :

| Méthode | Commande | Persistance |
| --- | --- | --- |
| Variable d'environnement | `MAI_SERVER=http://localhost:4000 bun run dev -- <command>` | Commande en cours uniquement |
| Option de connexion | `mai login --server http://localhost:4000` | Sauvegardé dans `~/.mai/settings.json` |

Priorité : Variable d'env `MAI_SERVER` > `settings.json` > URL officielle par défaut.

## Auto-complétion de Terminal

### Installer l'auto-complétion pour un CLI lié

| Terminal | Commande |
| --- | --- |
| `zsh` | `source <(mai completion zsh)` |
| `bash` | `source <(mai completion bash)` |

### Utiliser l'auto-complétion pendant le développement local

| Terminal | Commande |
| --- | --- |
| `zsh` | `source <(bun src/index.ts completion zsh)` |
| `bash` | `source <(bun src/index.ts completion bash)` |

- L'auto-complétion dépend du contexte. Par exemple, `mai agent <Tab>` affiche les sous-commandes de l'agent au lieu des commandes principales.
- Si vous mettez à jour la logique d'auto-complétion localement, réexécutez la commande `source <(...)` correspondante pour recharger la configuration.
- L'auto-complétion enregistre uniquement les fonctions shell. Elle n'installe pas le binaire `mai` en lui-même.

## Vérification Rapide

```bash
which mai
mai --help
mai agent <TAB>
```
