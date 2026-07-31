# Lancement officiel de mProjects API v2

Nous sommes fiers d'annoncer la sortie majeure de **mProjects API v2**, conçue pour offrir aux développeurs une intégration encore plus sécurisée, performante et personnalisable de nos modèles IA.

## Nouveautés majeures de la v2

### 1. Clés API Développeurs & Hachage SHA-256
Chaque développeur peut désormais générer ses propres clés API personnalisées (`mai_live_...`). Pour garantir une sécurité maximale :
- La clé complète en clair n'est retournée qu'une **seule et unique fois** lors de sa création.
- Seul le **hash SHA-256** est persisté sur nos serveurs.
- Authentification standardisée via l'en-tête `Authorization: Bearer <clé_api>`.

### 2. Gestion de Projets (`/v1/projects`)
Organisez vos intégrations par projets grâce aux nouvelles routes dédiées :
- `GET /v1/projects` : Liste de vos projets actifs
- `POST /v1/projects` : Création rapide d'un nouveau projet
- `GET /v1/projects/:id` : Consultation des métadonnées d'un projet existant

### 3. Rate Limiting & Quotas par Forfait
L'API v2 intègre un contrôle de débit par IP et par compte pour assurer la stabilité du réseau :
- **Free** : 500 requêtes / mois
- **Plus** : 1 000 requêtes / mois
- **Pro** : 2 000 requêtes / mois
- **Max** : 5 000 requêtes / mois

Rendez-vous dans la rubrique [Gestion des Clés API](/api/keys) de votre console pour commencer dès maintenant !
