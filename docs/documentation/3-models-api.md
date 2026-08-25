---
title: "Catalogue des Modèles d'IA"
description: "Consultation des modèles d'intelligence artificielle, modèles souverains mAI locaux, modèles cloud et modèles de génération d'images."
category: "API"
order: 4
---

# API du Catalogue des Modèles 🤖📚

Les points de terminaison des modèles vous permettent d'inspecter par voie logicielle la liste exhaustive des architectures d'IA disponibles, leurs capacités multi-modales, fenêtres de contexte et compatibilités selon votre formule d'abonnement.

---

## 🌐 1. Catalogue Global des Modèles d'IA

Renvoie la liste des modèles de langage et d'analyse compatibles avec votre clé API.

```http
GET https://mai.val.run/v1/models
```

### Exemple de Réponse
```json
{
  "object": "list",
  "data": [
    {
      "id": "poolside/laguna-xs-2.1:free",
      "name": "Laguna XS 2.1 (Free)",
      "description": "Modèle d'inférence ultra-rapide optimisé pour le dialogue et le code.",
      "context_length": 32768,
      "pricing": { "prompt": "0", "completion": "0" }
    },
    {
      "id": "anthropic/claude-3.5-sonnet",
      "name": "Claude 3.5 Sonnet",
      "description": "Modèle de pointe pour le raisonnement logique complexe et le codage avancé.",
      "context_length": 200000
    }
  ]
}
```

---

## 🇫🇷 2. Catalogue des Modèles Souverains mAI (Locaux)

Renvoie les spécifications complètes de la famille des modèles propriétaires **mAI** (conçus pour l'exécution locale via Ollama / GGUF ou inférence hébergée).

```http
GET https://mai.val.run/v1/models/mai
```

### Modèles Principaux de la Gamme
- **`mai-1.5-light`** (4B Multimodal) : Fenêtre de 262k tokens, vision native, thinking et appels d'outils.
- **`mai-1.5-apex`** (9B Raisonnement) : Modèle d'élite pour la programmation et l'analyse logique avancée.
- **`mai-1.5-opal`** (27B Expert) : L'équilibre parfait entre vélocité et puissance cognitive pour entreprises.

---

## 🎨 3. Catalogue des Modèles de Génération d'Images

Renvoie la liste des architectures de synthèse d'images (Black Forest Labs FLUX, Stability AI, Midjourney, Recraft) selon votre forfait.

```http
GET https://mai.val.run/v1/models/images
```

### Exemple de Réponse
```json
{
  "object": "list",
  "data": [
    {
      "id": "black-forest-labs/flux-1-schnell",
      "name": "FLUX.1 Schnell",
      "description": "Modèle de génération d'images ultra-rapide en 4 étapes par Black Forest Labs (Text-to-Image).",
      "features": ["text-to-image"],
      "created": 1740000000
    },
    {
      "id": "black-forest-labs/flux-1-dev",
      "name": "FLUX.1 Dev",
      "description": "Modèle phare de haute précision pour la synthèse d'images photoréalistes et artistiques.",
      "features": ["text-to-image"],
      "created": 1740000000
    },
    {
      "id": "black-forest-labs/flux-1.1-pro",
      "name": "FLUX 1.1 Pro",
      "description": "Qualité visuelle maximale, typographie fidèle et détails photoréalistes d'élite.",
      "features": ["text-to-image"],
      "created": 1740000000
    }
  ]
}
```

---

## 🔍 4. Détails d'un Modèle Spécifique

Récupère les informations techniques et les contraintes matérielles recommandées pour un modèle précis.

```http
GET https://mai.val.run/v1/models/:model_id
```

### Exemple de Requête
```bash
curl -X GET "https://mai.val.run/v1/models/mai-1.5-light" \
  -H "Authorization: Bearer mp-votre_cle_api"
```
