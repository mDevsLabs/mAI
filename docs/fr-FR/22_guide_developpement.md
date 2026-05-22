# Guide de développement 🛠️

Ce guide fournit des instructions de base pour les développeurs souhaitant contribuer au projet **mAI** ou exécuter le code source en mode de développement.

## Structure du projet

mAI est structuré sous forme de monorepo moderne (utilisant pnpm et Turborepo) :
- `apps/web` : L'application principale Next.js.
- `packages/` : Modules partagés et configurations réutilisables (composants UI, types, helpers).

## Lancement en mode développement

1. **Prérequis** : Assurez-vous d'avoir installé Node.js (version LTS recommandée) et pnpm ou bun.
2. **Installation des dépendances** :
   ```bash
   pnpm install
   ```
3. **Lancer le serveur de développement** :
   ```bash
   pnpm run dev
   ```
   L'application sera accessible localement à l'adresse `http://localhost:3000`.

## Tests unitaires et intégration

Nous utilisons **Vitest** pour nos suites de tests :
- Pour exécuter les tests une seule fois : `pnpm run test`
- Pour exécuter les tests en mode observation (watch) : `pnpm run test:watch`

Veuillez vous assurer que tous les tests passent avec succès avant de soumettre une modification.
