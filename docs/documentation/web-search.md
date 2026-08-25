---
title: "Outil de Recherche Web (You.com)"
description: "Documentation de l'outil web_search et de l'endpoint de recherche en temps réel via You.com avec triple fallback."
category: "API"
order: 6
---

# Outil de Recherche Web (You.com) 🌐

L'API mAI intègre un outil de recherche Web en temps réel propulsé par **You.com Search API**. Cet outil permet aux modèles de langage (LLM) d'accéder aux informations fraîches, aux actualités récentes et aux sources Internet en direct.

---

## 🔑 Architecture Résiliente : Triple Fallback

Pour garantir une disponibilité continue sans interruption de service, la recherche Web utilise une stratégie de **triple fallback séquentiel** de clés API :
1. `YOU_API_KEY` (Clé Primaire)
2. `YOU_API_KEY_2` (Clé Secondaire)
3. `YOU_API_KEY_3` (Clé Tertiaire)

Si la clé principale atteint sa limite de requêtes (HTTP 429) ou rencontre une erreur, le système bascule instantanément et de façon transparente sur la clé suivante.

---

## 🛠️ Utilisation comme Tool Calling (OpenAI Standard)

L'outil `web_search` est automatiquement injecté pour les modèles supportant les `tools` (`Black Forest Labs`, `Google Gemini`, `Meta Llama`, `mAI Apex/Opal`, etc.).

### Définition de l'outil
\`\`\`json
{
  "type": "function",
  "function": {
    "name": "web_search",
    "description": "Recherche sur le Web des informations récentes et actualisées en temps réel via You.com.",
    "parameters": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "La requête de recherche textuelle claire et précise."
        }
      },
      "required": ["query"]
    }
  }
}
\`\`\`

---

## 🛑 Comment désactiver la Recherche Web ?

La recherche Web est **activée par défaut** pour enrichir automatiquement les réponses de vos assistants. Vous pouvez la désactiver de **3 manières simples** :

### Méthode 1 : Dans le corps de la requête JSON (Recommandé)
Ajoutez `"web_search": false` (ou `"enable_web_search": false`) dans votre payload :

\`\`\`json
{
  "model": "meta-llama/llama-3.3-70b-instruct:free",
  "messages": [
    { "role": "user", "content": "Quelle est la capitale de la France ?" }
  ],
  "web_search": false
}
\`\`\`

### Méthode 2 : Via un en-tête HTTP
Ajoutez l'en-tête `X-Web-Search: false` ou `X-Disable-Web-Search: true` à votre requête :

\`\`\`bash
curl -X POST https://mai.val.run/v1/chat/completions \
  -H "Authorization: Bearer VOTRE_CLE_API" \
  -H "X-Web-Search: false" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "google/gemini-2.5-flash:free",
    "messages": [{"role": "user", "content": "Bonjour"}]
  }'
\`\`\`

### Méthode 3 : Spécification manuelle de `tools`
Si vous passez votre propre tableau de `tools` dans la requête et qu'il ne contient pas `web_search`, l'outil ne sera pas injecté.

---

## 📡 Endpoint Dédié : Recherche Directe

Vous pouvez également interroger directement le moteur de recherche You.com sans passer par une complétion de chat.

**Endpoint**
\`\`\`http
POST /v1/web/search
\`\`\`

**Corps de requête**
\`\`\`json
{
  "query": "dernières actualités intelligence artificielle 2026",
  "count": 5
}
\`\`\`

**Exemple de réponse**
\`\`\`json
{
  "success": true,
  "query": "dernières actualités intelligence artificielle 2026",
  "provider": "you.com",
  "results": [
    {
      "title": "mAI annonce la version 1.5 de ses modèles",
      "url": "https://m-ai.fr/news",
      "snippet": "mDevsLabs dévoile sa nouvelle suite de modèles multimodaux mAI 1.5 avec support de vision et recherche Web intégrée..."
    }
  ]
}
\`\`\`
