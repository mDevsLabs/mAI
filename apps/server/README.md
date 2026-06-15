# 🖥️ mAI Server (`@mdevs/mai-server`)

Le serveur backend de **mAI**, fournissant l'API et les routeurs tRPC, les services de base de données, la gestion des configurations et des workflows pour l'application.

## 🚀 Fonctionnalités

- **tRPC API Router** : Points d'accès typés pour une communication fluide avec le frontend.
- **Gestion des configurations** : Configurations globales, dynamiques et de runtime.
- **Workflows & Modules** : Exécution de tâches asynchrones et logique métier modulaire.
- **Gestion de la base de données** : Intégration avec PostgreSQL via Drizzle ORM.

## 🛠️ Développement

### Vérification des types

Pour valider les types TypeScript du serveur :

```bash
bun run type-check
```

## 📂 Structure du projet

- `src/routers/` : Routeurs tRPC exposant les procédures API.
- `src/services/` : Services backend (base de données, runtime, stockage).
- `src/modules/` : Logique métier modulaire.
- `src/workflows/` : Processus et pipelines complexes.
- `src/featureFlags/` : Contrôle des fonctionnalités à la demande.
