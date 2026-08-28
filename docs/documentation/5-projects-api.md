---
title: "API Projets & Écosystème"
description: "Gestion programmatique des applications et espaces de travail mAI (Web, Pulse, CLI, Coder)."
category: "API"
order: 8
---

# API des Projets & de l'Écosystème 

L'API des projets permet d'administrer, d'inspecter et de synchroniser programmatiquement vos environnements de développement, vos configurations d'agents et les applications de la suite mAI (mAI Web, mAI Pulse, mAI CLI, mAI Coder).

---

## 1. Lister l'Ensemble des Projets

Renvoie la liste détaillée de tous les projets de la plateforme mAI rattachés à votre compte.

```http
GET https://mai.val.run/v1/projects
Authorization: Bearer mp-votre_cle_complete
```

### Exemple de Réponse
```json
{
  "object": "list",
  "data": [
    {
      "id": "web",
      "name": "mAI Web",
      "status": "Alpha",
      "description": "Application web d'intelligence artificielle souveraine accessible directement dans le navigateur.",
      "github_url": "https://github.com/mDevsLabs/Web"
    },
    {
      "id": "pulse",
      "name": "mAI Pulse",
      "status": "Bêta",
      "description": "Suite d'extensions et d'outils intelligents pour la productivité au quotidien.",
      "github_url": "https://github.com/mDevsLabs/Pulse"
    },
    {
      "id": "cli",
      "name": "mAI CLI",
      "status": "Bêta",
      "description": "Assistant de terminal interactif et scriptable pour développeurs et sysadmins.",
      "github_url": "https://github.com/mDevsLabs/CLI"
    },
    {
      "id": "coder",
      "name": "mAI Coder",
      "status": "Alpha",
      "description": "Environnement de développement assisté par agents d'IA autonomes et protocole MCP.",
      "github_url": "https://github.com/mDevsLabs/Coder"
    }
  ]
}
```

---

## 2. Obtenir les Détails d'un Projet Ciblé

```http
GET https://mai.val.run/v1/projects/:project_id
```

*(Identifiants acceptés : `web`, `pulse`, `cli`, `coder`)*

### Exemple cURL
```bash
curl -X GET "https://mai.val.run/v1/projects/coder" \
  -H "Authorization: Bearer mp-votre_cle_complete"
```
