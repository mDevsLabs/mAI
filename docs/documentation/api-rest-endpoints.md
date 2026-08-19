---
title: "Endpoints REST"
description: "Documentation complète des endpoints HTTP pour chat, completion et embeddings."
category: "API"
order: 1
---

# Spécifications de l'API REST v1 🌐🔌

L'API REST de **mDevsLabs** est entièrement compatible avec le standard OpenAI API v1 tout en offrant des extensions spécifiques pour les modèles mAI.

---

## 📌 Endpoints Principaux

### 1. `POST /v1/chat/completions`

Génère une réponse textuelle ou un flux de tokens (Server-Sent Events) à partir d'un historique de discussion.

#### Requête Exemple

```bash
curl -X POST https://mai-devs.vercel.app/api/v1/chat/completions \
  -H "Authorization: Bearer $MAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mAI-1",
    "messages": [
      {"role": "user", "content": "Quelle est la vitesse de la lumière ?"}
    ],
    "temperature": 0.5,
    "stream": false
  }'
```

### 2. `POST /v1/embeddings`

Calcule le vecteur de plongement sémantique d'un texte.

#### Requête Exemple

```bash
curl -X POST http://localhost:11434/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mai-embeddings",
    "input": "Optimisation des pipelines RAG"
  }'
```

### 3. `GET /v1/models`

Renvoie la liste des modèles actuellement chargés en mémoire.
