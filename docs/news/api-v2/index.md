# Lancement officiel de mAI API v2

Nous annonçons la disponibilité générale de **mAI API v2**, conçue pour offrir une intégration sécurisée, performante et personnalisable de nos modèles d'intelligence artificielle.

## Nouveautés majeures de la version 2

### 1. Clés API Développeurs et hachage SHA-256
Chaque développeur a désormais la possibilité de générer des clés API personnalisées (`mai_live_...`). Pour garantir un niveau de sécurité optimal :
- La clé complète en clair n'est retournée qu'une **seule et unique fois** lors de sa création.
- Seule l'empreinte **SHA-256** est conservée sur nos serveurs.
- L'authentification s'effectue selon le standard `Authorization: Bearer <clé_api>`.

### 2. Gestion de projets (`/v1/projects`)
L'organisation des intégrations par projet s'effectue via de nouvelles routes dédiées :
- `GET /v1/projects` : Liste des projets actifs
- `POST /v1/projects` : Création d'un projet
- `GET /v1/projects/:id` : Consultation des métadonnées d'un projet

### 3. Contrôle de débit et quotas par forfait
L'API v2 intègre un contrôle de débit par adresse IP et par compte afin d'assurer la stabilité globale de l'infrastructure :
- **Free** : 500 requêtes / mois
- **Plus** : 1 000 requêtes / mois
- **Pro** : 2 000 requêtes / mois
- **Max** : 5 000 requêtes / mois

Rendez-vous dans la rubrique [Gestion des Clés API](/api/keys) de la console pour débuter vos intégrations.
