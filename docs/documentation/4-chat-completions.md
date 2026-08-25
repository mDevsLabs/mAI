---
title: "Génération de Texte & Chat Completions"
description: "Inférence textuelle, dialogue multi-tours, streaming temps réel et compatibilité complète avec la spécification OpenAI."
category: "API"
order: 5
---

# Génération de Texte & Chat Completions 💬⚡

Le point de terminaison `/v1/chat/completions` constitue le cœur de l'inférence conversationnelle de l'écosystème mAI. Conçu dans le respect strict des standards de l'industrie, il est 100% compatible avec les SDK officiels OpenAI, LangChain et Semantic Kernel.

---

## 📡 1. Spécification de l'Endpoint

```http
POST https://mai.val.run/v1/chat/completions
Content-Type: application/json
Authorization: Bearer mp-votre_cle_secrete_complete
```

---

## 📝 2. Paramètres de la Requête (JSON Body)

| Paramètre | Type | Requis | Description |
| :--- | :--- | :--- | :--- |
| `model` | `string` | **Oui** | Identifiant du modèle (ex: `poolside/laguna-xs-2.1:free`, `mai-1.5-light`). |
| `messages` | `array` | **Oui** | Historique structuré des messages (`role`, `content`). |
| `temperature` | `number` | Non | Contrôle de l'aléatoire (0.0 = déterministe, 1.0 = créatif). Défaut : `0.7`. |
| `max_tokens` | `integer` | Non | Nombre maximum de tokens à générer dans la réponse. |
| `stream` | `boolean` | Non | Active la diffusion progressive Server-Sent Events (`text/event-stream`). |
| `tools` | `array` | Non | Définition des fonctions et outils externes appelables par le modèle. |

---

## 💻 3. Exemples d'Intégration

### Exemple Standard (cURL)
```bash
curl -X POST "https://mai.val.run/v1/chat/completions" \
  -H "Authorization: Bearer mp-votre_cle_complete" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "poolside/laguna-xs-2.1:free",
    "messages": [
      { "role": "system", "content": "Tu es un assistant technique expert en architecture logicielle." },
      { "role": "user", "content": "Quels sont les avantages d'une politique Zero Data Retention (ZDR) pour une entreprise ?" }
    ],
    "temperature": 0.5,
    "max_tokens": 500
  }'
```

### Exemple avec le SDK Officiel OpenAI en Python
```python
from openai import OpenAI
import os

client = OpenAI(
    base_url="https://mai.val.run/v1",
    api_key=os.environ.get("MAI_API_KEY", "mp-votre_cle_complete")
)

response = client.chat.completions.create(
    model="poolside/laguna-xs-2.1:free",
    messages=[
        {"role": "system", "content": "Tu es un ingénieur IA bienveillant et concis."},
        {"role": "user", "content": "Explique le fonctionnement du streaming de tokens."}
    ],
    temperature=0.7
)

print(response.choices[0].message.content)
```

### Exemple avec Streaming en TypeScript / Node.js
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://mai.val.run/v1",
  apiKey: process.env.MAI_API_KEY,
});

async function main() {
  const stream = await openai.chat.completions.create({
    model: "poolside/laguna-xs-2.1:free",
    messages: [{ role: "user", content: "Écris un poème sur la souveraineté numérique." }],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
}

main();
```

---

## 📊 4. Format de la Réponse Standard

```json
{
  "id": "chatcmpl-8a1b2c3d4e",
  "object": "chat.completion",
  "created": 1740000000,
  "model": "poolside/laguna-xs-2.1:free",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "La politique Zero Data Retention (ZDR) garantit que les données d'entreprise ne sont ni stockées de manière persistante, ni réutilisées pour l'entraînement d'IA tierces."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 42,
    "completion_tokens": 85,
    "total_tokens": 127
  }
}
```
