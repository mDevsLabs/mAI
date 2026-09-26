---
title: "Authentification & Gestion des Clés"
description: "Génération, format standardisé des clés API, authentification par Bearer token et bonnes pratiques de sécurité."
category: "API"
order: 2
---

# Authentification & Gestion des Clés d'API 

L'accès à l'API mAI nécessite une authentification sécurisée basée sur des jetons d'accès chiffrés (*API Keys*). Chaque clé associe vos requêtes à votre compte et applique dynamiquement les quotas de votre forfait d'abonnement (*Free*, *Plus*, *Pro*, *Max*).

---

## 1. Structure & Format des Clés

Les nouvelles clés d’API utilisent le format suivant :

```text
mai-{forfait}-{5 caractères publics}-{8 caractères secrets}
Exemple : mai-pro-A1B2C-DEF45678
```

Les anciens préfixes `mp-*`, `mai_live*` et `sk_mp_*` restent acceptés afin de préserver les intégrations existantes.

> [!IMPORTANT]
> Les clés complètes doivent être transmises dans leur intégralité. L'utilisation d'un préfixe tronqué (ex: les 8 premiers caractères) entraîne un refus immédiat de la requête (`401 Unauthorized`).

---

## 2. Génération & Révocation d'une Clé

1. Accédez au tableau de bord dans la section [Clés API](/account/keys).
2. Sélectionnez **Créer une clé API**, attribuez-lui un nom explicite (ex: `Backend Production`, `Bot Discord`) et définissez une limite maximale optionnelle.
3. La clé est générée automatiquement par le système. Son secret n’est exposé en clair qu’une unique fois, au moment de sa création. Après cela, **seul son préfixe public est renvoyé à l’interface** ; les opérations autorisées résolvent la clé côté serveur à partir de la session du propriétaire.

> [!NOTE]
> La plateforme conserve le secret côté serveur pour permettre les appels API ultérieurs. Elle ne le renvoie pas dans les endpoints de liste, d’usage ou de configuration.

Dans la console mAI, une clé existante est représentée par une **référence publique** (`keyRef`) contenant uniquement son préfixe. Les pages same-origin envoient cette référence avec la session ; le serveur vérifie le propriétaire et l’état de la clé avant d’injecter le secret dans la requête sortante.

---

## 3. Utilisation dans vos Requêtes HTTP

Chaque appel vers un point de terminaison sécurisé doit intégrer l'en-tête HTTP `Authorization` avec le schéma `Bearer` :

```http
Authorization: Bearer mai-free-A1B2C-DEF45678
```

### Exemple cURL
```bash
curl -X POST "https://mai.val.run/v1/chat/completions" \
  -H "Authorization: Bearer mai-pro-X1234-Y56789012" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "poolside/laguna-xs-2.1:free",
    "messages": [{"role": "user", "content": "Bonjour !"}]
  }'
```

### Exemple JavaScript / TypeScript
```typescript
const response = await fetch("https://mai.val.run/v1/models", {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${process.env.MAI_API_KEY}`,
    "Content-Type": "application/json"
  }
});
const data = await response.json();
console.log(data);
```

### Exemple Python
```python
import os
import requests

api_key = os.environ.get("MAI_API_KEY")
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

res = requests.get("https://mai.val.run/v1/models", headers=headers)
print(res.json())
```

---

## 4. Bonnes Pratiques de Sécurité Développeur

- **Variables d'Environnement** : Stockez systématiquement vos clés dans des variables d'environnement (`.env`, Vault, GitHub Secrets, Vercel Environment Variables).
- **Zéro Clé Côté Client** : Ne compilez jamais vos clés API au sein de frameworks frontend ou d'applications mobiles sans passer par un serveur intermédiaire (backend proxy).
- **Rotation et Révocation d'Urgence** : En cas de fuite de secret suspectée, révoquez immédiatement la clé compromise depuis `/account/keys` et instanciez-en une nouvelle.



