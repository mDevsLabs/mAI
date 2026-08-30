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

Toutes les clés d'API délivrées par la plateforme mAI répondent au format suivant :

```text
mp-[48 caractères hexadécimaux]
Exemple : mp-a1b2c3d4e5f678901234567890abcdef1234567890abcdef
```

> [!IMPORTANT]
> Les clés complètes doivent être transmises dans leur intégralité. L'utilisation d'un préfixe tronqué (ex: les 8 premiers caractères) entraîne un refus immédiat de la requête (`401 Unauthorized`).

---

## 2. Génération & Révocation d'une Clé

1. Accédez au tableau de bord dans la section [Clés API](/account/keys).
2. Sélectionnez **Créer une clé API**, attribuez-lui un nom explicite (ex: `Backend Production`, `Bot Discord`) et définissez une limite maximale optionnelle.
3. La clé est générée automatiquement par le système. Elle n'est exposée en clair qu'une unique fois, au moment de sa création. Pour des raisons de sécurité cryptographique, **seul le hachage SHA-256 est conservé dans nos bases de données situées dans l'Union européenne**. Même le personnel technique n'y a pas accès.

> [!NOTE]
> La génération de la clé s'effectue automatiquement par le système avant son chiffrement en base. Aucune copie interne du secret n'est conservée.

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



