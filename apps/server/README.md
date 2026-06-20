# @mdevs/mai-server

Ce module contient les services backend, les routeurs tRPC, les configurations système et les workflows pour l'application serveur de mAI.

## 📁 Structure du Projet

- **`src/featureFlags`** : Gestion et évaluation des indicateurs de fonctionnalités (feature flags).
- **`src/globalConfig`** : Configurations système globales du serveur.
- **`src/routers`** : Définition des routeurs tRPC exposant les APIs sécurisées et typées au client.
- **`src/services`** : Services d'infrastructure internes (ex: service d'email, base de données).
- **`src/workflows`** : Workflows asynchrones et gestion des tâches avec Upstash/QStash.

## 🚀 Développement et Validation

Pour valider les types TypeScript du projet serveur :

```bash
pnpm type-check
```
