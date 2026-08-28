---
title: "Outil de Recherche Web (You.com)"
description: "Documentation de l'outil web_search et de l'endpoint de recherche en temps rÃ©el via You.com avec triple fallback."
category: "API"
order: 6
---

# Outil de Recherche Web (You.com) ð

L'API mAI intÃ¨gre un outil de recherche Web en temps rÃ©el propulsÃ© par **You.com Search API**. Cet outil permet aux modÃ¨les de langage (LLM) d'accÃ©der aux informations fraÃ®ches, aux actualitÃ©s rÃ©centes et aux sources Internet en direct.

---

## ð Architecture RÃ©siliente : Triple Fallback

Pour garantir une disponibilitÃ© continue sans interruption de service, la recherche Web utilise une stratÃ©gie de **triple fallback sÃ©quentiel** de clÃ©s API :
1. `YOU_API_KEY` (ClÃ© Primaire)
2. `YOU_API_KEY_2` (ClÃ© Secondaire)
3. `YOU_API_KEY_3` (ClÃ© Tertiaire)

Si la clÃ© principale atteint sa limite de requÃªtes (HTTP 429) ou rencontre une erreur, le systÃ¨me bascule instantanÃ©ment et de faÃ§on transparente sur la clÃ© suivante.

---

## ð ï¸ Utilisation comme Tool Calling (OpenAI Standard)

L'outil `web_search` est automatiquement injectÃ© pour les modÃ¨les supportant les `tools` (`Black Forest Labs`, `Google Gemini`, `Meta Llama`, `mAI Apex/Opal`, etc.).

### DÃ©finition de l'outil
\`\`\`json
{
  "type": "function",
  "function": {
    "name": "web_search",
    "description": "Recherche sur le Web des informations rÃ©centes et actualisÃ©es en temps rÃ©el via You.com.",
    "parameters": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "La requÃªte de recherche textuelle claire et prÃ©cise."
        }
      },
      "required": ["query"]
    }
  }
}
\`\`\`

---

## ð Comment dÃ©sactiver la Recherche Web ?

La recherche Web est **activÃ©e par dÃ©faut** pour enrichir automatiquement les rÃ©ponses de vos assistants. Il est possible de la dÃ©sactiver de **3 maniÃ¨res simples** :

### MÃ©thode 1 : Dans le corps de la requÃªte JSON (RecommandÃ©)
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

### MÃ©thode 2 : Via un en-tÃªte HTTP
Ajoutez l'en-tÃªte `X-Web-Search: false` ou `X-Disable-Web-Search: true` Ã  votre requÃªte :

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

### MÃ©thode 3 : SpÃ©cification manuelle de `tools`
Si vous passez votre propre tableau de `tools` dans la requÃªte et qu'il ne contient pas `web_search`, l'outil ne sera pas injectÃ©.

---

## ð¡ Endpoint DÃ©diÃ© : Recherche Directe

Il est possible de Ã©galement interroger directement le moteur de recherche You.com sans passer par une complÃ©tion de chat.

**Endpoint**
\`\`\`http
POST /v1/web/search
\`\`\`

**Corps de requÃªte**
\`\`\`json
{
  "query": "derniÃ¨res actualitÃ©s intelligence artificielle 2026",
  "count": 5
}
\`\`\`

**Exemple de rÃ©ponse**
\`\`\`json
{
  "success": true,
  "query": "derniÃ¨res actualitÃ©s intelligence artificielle 2026",
  "provider": "you.com",
  "results": [
    {
      "title": "mAI annonce la version 1.5 de ses modÃ¨les",
      "url": "https://m-ai.fr/news",
      "snippet": "mDevsLabs dÃ©voile sa nouvelle suite de modÃ¨les multimodaux mAI 1.5 avec support de vision et recherche Web intÃ©grÃ©e..."
    }
  ]
}
\`\`\`
