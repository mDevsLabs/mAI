# API des Projets

L'API des projets vous permet de créer et de lister les projets IA liés à votre compte utilisateur de manière programmatique.

## Lister vos projets

Renvoie la liste des 20 derniers projets que vous avez créés.

**Endpoint**
\`\`\`http
GET /v1/projects
\`\`\`

**Exemple de réponse**
\`\`\`json
{
  "projects": [
    {
      "id": 1,
      "user_id": "votre-uuid",
      "project_id": "proj-123abc456",
      "name": "Mon Projet IA",
      "description": "Description du projet",
      "is_public": false,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
\`\`\`

## Créer un projet

Permet de créer un nouveau projet dans votre espace de travail.

**Endpoint**
\`\`\`http
POST /v1/projects
\`\`\`

**Corps de la requête (JSON)**
\`\`\`json
{
  "name": "Nouveau Projet",
  "description": "Créé via API",
  "isPublic": false
}
\`\`\`

**Exemple de réponse**
\`\`\`json
{
  "success": true,
  "project_id": "proj-a1b2c3d4e"
}
\`\`\`

## Récupérer un projet spécifique

Renvoie les détails d'un projet ciblé en spécifiant son ID.

**Endpoint**
\`\`\`http
GET /v1/projects/:id
\`\`\`
*(Remplacez `:id` par l'identifiant du projet, ex: `proj-a1b2c3d4e`)*

**Exemple de réponse**
\`\`\`json
{
  "project": {
    "id": 2,
    "project_id": "proj-a1b2c3d4e",
    "name": "Nouveau Projet",
    "description": "Créé via API",
    "is_public": false,
    "created_at": "2024-01-02T15:30:00Z"
  }
}
\`\`\`
