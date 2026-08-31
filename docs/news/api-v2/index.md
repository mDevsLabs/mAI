# Lancement officiel de mAI API v2

Nous annonçons la disponibilité générale de **mAI API v2**, conçue pour offrir une intégration sécurisée, performante et personnalisable de nos modèles d'intelligence artificielle.

## Nouveautés majeures de la version 2

### 1. Clés API Développeurs et hachage SHA-256
Chaque développeur a désormais la possibilité de générer des clés API personnalisées (`mai-[free|plus|pro|max]-XXXXX-XXXXXXXX`). Pour garantir un niveau de sécurité optimal :
- La clé complète en clair n'est exposée qu'une **seule et unique fois**, au moment de sa génération automatique.
- Seule l'empreinte **SHA-256** est conservée dans nos bases de données (UE), et non sur les serveurs d'application.
- L'authentification s'effectue selon le standard `Authorization: Bearer <clé_api>`.

### 2. Gestion de projets (`/v1/projects`)
L'organisation des intégrations par projet s'effectue via de nouvelles routes dédiées :
- `GET /v1/projects` : Liste des projets actifs
- `POST /v1/projects` : Création d'un projet
- `GET /v1/projects/:id` : Consultation des métadonnées d'un projet

### 3. Contrôle de débit et quotas par forfait
L'API v2 intègre un contrôle de débit par adresse IP et par compte afin d'assurer la stabilité globale de l'infrastructure :
- **Free** : 500 requêtes / semaine
- **Plus** : 1 500 requêtes / semaine
- **Pro** : 3 000 requêtes / semaine
- **Max** : 7 500 requêtes / semaine

Consultez la rubrique [Gestion des Clés API](/api/keys) de la console pour initier vos intégrations.


