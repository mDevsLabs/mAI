# Base de données 🗄️

**mAI** gère le stockage de ses données de façon structurée et performante afin de garantir un accès rapide et hors ligne à vos conversations et à vos configurations.

## Architecture de stockage

Selon l'environnement d'exécution (Bureau ou Web), mAI utilise différents systèmes de stockage :
- **Application Bureau (Desktop)** : Utilise une base de données locale légère (SQLite) stockée dans le répertoire utilisateur de l'application. Elle permet d'assurer d'excellentes performances de lecture/écriture pour de larges volumes d'historique.
- **Application Web** : S'appuie sur la base de données interne du navigateur (IndexedDB) ou sur des services d'API externes synchronisés avec une base PostgreSQL si le mode cloud est activé.

## Migrations et schéma de données

mAI intègre un système de migration automatique de schéma de base de données. À chaque mise à jour de l'application, si la structure de la base de données change (par exemple, ajout d'un nouveau champ pour les agents ou les messages), les migrations s'exécutent de manière transparente lors du démarrage sans altérer vos données existantes.

## Optimisation et maintenance

Pour conserver une application rapide :
- **Nettoyage automatique** : Les messages temporaires ou de sessions expirées peuvent être supprimés périodiquement.
- **Indexation** : Les messages de discussion sont indexés pour permettre une recherche textuelle quasi instantanée.
