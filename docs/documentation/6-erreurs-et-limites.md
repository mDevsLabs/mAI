---
title: "Codes d'Erreurs, Quotas & Rate Limits"
description: "Gestion des erreurs HTTP, codes de statut standards, limites de forfaits (Free, Plus, Pro, Max) et stratégies de résilience."
category: "API"
order: 14
---

# Codes d'Erreurs, Quotas & Rate Limiting 

L'API mAI intègre une gouvernance stricte de gestion des erreurs et de protection des infrastructures pour garantir une haute disponibilité et une équité d'accès aux ressources de calcul.

---

## 1. Quotas Mensuels et Journaliers par Forfait

| Forfait | Quota Requêtes API (Mensuel) | Modèles Textes Accessibles | Quota Images (Journalier) | Modèles d'Images |
| :--- | :--- | :--- | :--- | :--- |
| **Free** | **1 000 requêtes / mois** | Modèles étiquetés `:free` | **3 images / jour** | FLUX.1 Schnell |
| **Plus** | **5 000 requêtes / mois** | Tous modèles mAI & Cloud | **5 images / jour** | Tous modèles (FLUX, Pro, etc.) |
| **Pro** | **25 000 requêtes / mois** | Tous modèles (Priorité Haute) | **10 images / jour** | Tous modèles (FLUX, Pro, etc.) |
| **Max** | **100 000 requêtes / mois** | Tous modèles (Débit Dédié) | **20 images / jour** | Tous modèles (FLUX, Pro, etc.) |

> [!NOTE]
> Les compteurs de requêtes mensuelles sont automatiquement réinitialisés le 1er de chaque mois à 00:00 UTC. Les quotas de génération d'images sont réinitialisés chaque jour à minuit UTC.

---

## 2. Codes de Statut HTTP Standards

| Code HTTP | Statut | Cause Fréquente | Résolution Recommandée |
| :--- | :--- | :--- | :--- |
| **`200 OK`** | Succès | Requête exécutée avec succès. | Exploiter les données retournées. |
| **`400 Bad Request`** | Erreur de Requête | JSON malformé ou paramètre requis manquant. | Vérifier la syntaxe du JSON et les paramètres obligatoires. |
| **`401 Unauthorized`** | Authentification Échouée | Clé API absente, tronquée ou invalide. | Transmettre la clé API complète `mp-...` dans l'en-tête `Authorization: Bearer <clé>`. |
| **`403 Forbidden`** | Accès Refusé | Modèle non inclus dans le forfait (ex: modèle payant appelé avec un compte Free). | Choisir un modèle `:free` ou mettre à niveau votre forfait vers Plus/Pro/Max. |
| **`404 Not Found`** | Ressource Introuvable | Endpoint inexistant ou identifiant incorrect. | Vérifier l'URL et les identifiants de ressource. |
| **`429 Too Many Requests`** | Quota Épuisé | Quota mensuel ou journalier atteint. | Attendre la date de réinitialisation ou passer à une formule supérieure. |
| **`500 Internal Error`** | Erreur Serveur | Incident temporaire du fournisseur d'inférence. | Implémenter un mécanisme de repli avec backoff exponentiel. |

---

## 3. Format Standard des Réponses d'Erreur

Toutes les erreurs sont retournées avec une structure JSON normalisée :

```json
{
  "error": {
    "code": "quota_exceeded",
    "message": "Limite globale de requêtes API atteinte pour votre forfait (Free : 1000 requêtes max/mois). Veuillez mettre à niveau votre forfait.",
    "type": "permission_error",
    "param": null
  }
}
```

---

## 4. Stratégie de Résilience & Retry (Backoff Exponentiel)

Il est fortement recommandé d'implémenter une stratégie de réessai avec temporisation exponentielle (*Exponential Backoff with Jitter*) pour absorber les éventuelles variations de charge :

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 || response.status >= 500) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt++;
        continue;
      }
      return response;
    } catch (err) {
      if (attempt >= maxRetries - 1) throw err;
      attempt++;
    }
  }
}
```
