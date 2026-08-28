---
title: "Génération d'Images (Comet API & Flux)"
description: "Documentation de l'API de génération d'images, catalogue des modèles visuels et quotas journaliers par forfait."
category: "API"
order: 7
---

# Génération d'Images (Comet API & Flux) 

L'API mAI intègre la génération d'images par intelligence artificielle via **Comet API** et la suite de modèles **Black Forest Labs FLUX.1**, Stable Diffusion et Recraft.

---

## Quotas Quotidiens d'Images par Forfait

Les générations d'images sont soumises à un quota quotidien réinitialisé chaque jour à **minuit UTC (00:00 UTC)** :

| Forfait | Limite Quotidienne | Modèles Accessibles |
| :--- | :--- | :--- |
| **Free** | **3 images / jour** | Modèles Flux (Text-to-Image) |
| **Plus** | **5 images / jour** | Tous les modèles d'images |
| **Pro** | **10 images / jour** | Tous les modèles d'images |
| **Max** | **20 images / jour** | Tous les modèles d'images |

---

## 1. Lister les Modèles d'Images Disponibles

Renvoie la liste des modèles d'images autorisés selon votre forfait. Pour les utilisateurs *Free*, seuls les modèles avec la feature `text-to-image` et contenant `flux` sont affichés.

**Endpoint**
\`\`\`http
GET /v1/models/images
\`\`\`

**En-têtes**
\`\`\`http
Authorization: Bearer VOTRE_CLE_API
\`\`\`

**Exemple de réponse**
\`\`\`json
{
  "object": "list",
  "data": [
    {
      "id": "black-forest-labs/flux-1-schnell",
      "name": "FLUX.1 Schnell",
      "description": "Modèle de génération d'images ultra-rapide en 4 étapes par Black Forest Labs (Text-to-Image).",
      "created": 1740000000
    },
    {
      "id": "black-forest-labs/flux-1-dev",
      "name": "FLUX.1 Dev",
      "description": "Modèle phare de haute précision pour la synthèse d'images photoréalistes et artistiques (Text-to-Image).",
      "created": 1740000000
    },
    {
      "id": "black-forest-labs/flux-1.1-pro",
      "name": "FLUX 1.1 Pro",
      "description": "Le sommet de la qualité visuelle, cohérence typographique et détails avancés par Black Forest Labs.",
      "created": 1741000000
    }
  ]
}
\`\`\`

---

## 2. Générer une Image

Génère une image à partir d'une description textuelle (Prompt).

**Endpoint**
\`\`\`http
POST /v1/images/generations
\`\`\`

**En-têtes**
\`\`\`http
Authorization: Bearer VOTRE_CLE_API
Content-Type: application/json
\`\`\`

**Paramètres du corps de requête (JSON)**
* `prompt` *(string, obligatoire)* : Description textuelle de l'image souhaitée.
* `model` *(string, optionnel)* : ID du modèle (par défaut : `black-forest-labs/flux-1-schnell`).
* `size` *(string, optionnel)* : Dimensions de l'image, ex: `"1024x1024"`, `"512x512"`.
* `negative_prompt` *(string, optionnel)* : Éléments indésirables à exclure de l'image.
* `response_format` *(string, optionnel)* : `"url"` (par défaut) ou `"b64_json"`.

**Exemple de requête cURL**
\`\`\`bash
curl -X POST https://mai.val.run/v1/images/generations \
  -H "Authorization: Bearer VOTRE_CLE_API" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "black-forest-labs/flux-1-schnell",
    "prompt": "Un portrait cinématographique d'\''un astronaute observant une nébuleuse lumineuse, 8k, photoréaliste",
    "size": "1024x1024",
    "response_format": "url"
  }'
\`\`\`

**Exemple de réponse**
\`\`\`json
{
  "created": 1740398400,
  "data": [
    {
      "url": "https://pub-5fae5bdf3c3b4e23a8fa13226632e6a6.r2.dev/images/gen_abc123.png"
    }
  ],
  "usage": {
    "daily_used": 1,
    "daily_limit": 3,
    "plan": "Free"
  }
}
\`\`\`

---

## 3. Consulter son Quota et son Historique

**Endpoint Usage**
\`\`\`http
GET /v1/images/usage
\`\`\`

**Endpoint Historique**
\`\`\`http
GET /v1/images/history
\`\`\`
