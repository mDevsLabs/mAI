# @mdevs/mai-cli

Interface en ligne de commande de mAI.

## Développement local

| Tâche                          | Commande                    |
| ------------------------------ | --------------------------- |
| Exécuter en mode développement | `bun run dev -- <commande>` |
| Construire la CLI              | `bun run build`             |
| Lier `mai` à votre terminal    | `bun run cli:link`          |
| Supprimer le lien global       | `bun run cli:unlink`        |

- `bun run build` génère uniquement le fichier `dist/index.js`.
- Pour rendre `mai` disponible dans votre terminal, exécutez `bun run cli:link`.
- Après liaison, si votre terminal ne trouve toujours pas `mai`, exécutez la commande `rehash` dans `zsh`.

## URL de serveur personnalisée

Par défaut, la CLI se connecte à `https://mai-officiel.vercel.app`. Pour la pointer vers un autre serveur (par exemple, une instance locale) :

| Méthode                  | Commande                                                         | Persistance                                |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------------ |
| Variable d'environnement | `LOBEHUB_SERVER=http://localhost:4000 bun run dev -- <commande>` | Commande actuelle uniquement               |
| Option de connexion      | `mai login --server http://localhost:4000`                       | Enregistré dans `~/.lobehub/settings.json` |

Priorité : Variable d'environnement `LOBEHUB_SERVER` > `settings.json` > URL officielle par défaut.

## Complétion du terminal

### Installer la complétion pour une CLI liée

| Terminal | Commande                        |
| -------- | ------------------------------- |
| `zsh`    | `source <(mai completion zsh)`  |
| `bash`   | `source <(mai completion bash)` |

### Utiliser la complétion pendant le développement local

| Terminal | Commande                                     |
| -------- | -------------------------------------------- |
| `zsh`    | `source <(bun src/index.ts completion zsh)`  |
| `bash`   | `source <(bun src/index.ts completion bash)` |

- La complétion est sensible au contexte. Par exemple, `mai agent <Tab>` affiche les sous-commandes de l'agent au lieu des commandes de premier niveau.
- Si vous mettez à jour la logique de complétion localement, ré-exécutez la commande `source <(...)` correspondante pour la recharger dans la session active de votre terminal.
- La complétion enregistre uniquement les fonctions du terminal. Elle n'installe pas le binaire `mai` par elle-même.

## Vérification rapide

```bash
which mai
mai --help
mai agent <TAB>
```
