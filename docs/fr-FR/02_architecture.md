# Architecture de mAI 🏗️

L'application **mAI** repose sur une architecture moderne conçue pour la performance, l'extensibilité et la maintenabilité. Elle est construite sous forme de monorepo structuré.

## Technologies Clés

- **Framework Principal** : Next.js (avec App Router) pour le rendu et le routage.
- **Gestion d'État** : Zustand pour un contrôle d'état léger et réactif côté client.
- **Design & UI** : Composants Ant Design stylisés avec `antd-style` et `@lobehub/ui`.
- **Base de Données** : SQLite en local (ou PostgreSQL en production) piloté par Drizzle ORM.

## Structure du Monorepo

Le code est divisé en packages réutilisables sous le répertoire `packages/` :
- `packages/const` : Contient les constantes globales et configurations.
- `packages/builtin-agents` : Agents par défaut (dont May).
- `packages/database` : Modèles de données, schémas Drizzle et migrations.
- `packages/types` : Déclarations de types TypeScript partagées.

Cette séparation permet d'isoler la logique métier (comme l'exécution des appels de modèle ou la gestion des plugins) de l'interface utilisateur web principale située dans `src/`.
