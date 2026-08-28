---
title: "Introduction à l'API REST"
description: "Vue d'ensemble de l'API mAI, architecture de distribution, compatibilité OpenAI et conventions HTTP."
category: "API"
order: 1
---

# Introduction à l'API REST mAI 

L'API REST **mAI** offre une interface unifiée, robuste et hautement performante pour interagir par voie logicielle avec l'ensemble des modèles d'intelligence artificielle de la suite **mDevsLabs** (séries `mAI-1.5`, `mAI-1.2`, `mAI-1.0` et modèles partenaires) ainsi que nos services de vision, de génération d'images et de recherche web.

---

## 1. Caractéristiques & Architecture

- **Compatibilité Universelle** : Les points de terminaison d'inférence (notamment `/v1/chat/completions`) respectent rigoureusement les spécifications standards de l'API OpenAI, facilitant l'intégration avec les SDK officiels (*Python*, *TypeScript/Node.js*, *Go*, *LangChain*, *LlamaIndex*).
- **Politique Prioritaire Zero Data Retention (ZDR)** : Traitement éphémère et stateless en mémoire vive, sans stockage persistant de vos invites ni réentraînement.
- **Répartition Sécurisée du Stockage** : Données structurées hébergées dans l'**Union Européenne (UE)**, stockage de fichiers et objets aux **États-Unis (USA)** sous chiffrement AES-256.
- **Support Multi-Modal & Agents** : Inférence textuelle, raisonnement logique (*thinking*), analyse visuelle et appels de fonctions (*tool/function calling*).

---

## 2. Point d'Accès & URL de Base

Toutes les requêtes adressées à l'API mAI doivent cibler l'URL de base sécurisée suivante :

```text
https://mai.val.run/v1
```

> [!NOTE]
> L'ensemble des échanges réseau doit impérativement s'effectuer via **HTTPS** chiffré en TLS 1.3. Les requêtes HTTP non sécurisées sont automatiquement rejetées.

---

## 3. Formats de Données & En-têtes

- **Format des Requêtes** : Corps au format `application/json` valide pour les requêtes `POST` et `PUT`.
- **Format des Réponses** : Réponses systématiquement encodées en JSON (`Content-Type: application/json; charset=utf-8`).
- **En-têtes HTTP Recommandés** :

| En-tête | Type | Description |
| :--- | :--- | :--- |
| `Authorization` | Requis | Token Bearer au format `Bearer mp-...` ou `Bearer mai_live_...` |
| `Content-Type` | Requis | Déclaré à `application/json` |
| `Accept` | Recommandé | Déclaré à `application/json` ou `text/event-stream` pour le streaming |

---

## 4. Démarrage Rapide (Quickstart)

```bash
# Exemple de requête cURL pour lister les modèles disponibles
curl -X GET "https://mai.val.run/v1/models" \
  -H "Authorization: Bearer mp-votre_cle_api_complete" \
  -H "Content-Type: application/json"
```

---

## 5. Parcours de la Documentation

1. [Authentification & Clés d'API](/docs?doc=2-authentification) : Génération, formats et gestion de la sécurité.
2. [Catalogue des Modèles](/docs?doc=3-models-api) : Modèles souverains mAI, modèles cloud et modèles d'images.
3. [Chat Completions](/docs?doc=4-chat-completions) : Génération de texte, streaming et appels d'outils.
4. [Génération d'Images](/docs?doc=image-generation) : Synthèse visuelle via Comet API et Flux.
5. [Recherche Web Temps Réel](/docs?doc=web-search) : Intégration de données web fraîches.
6. [Codes d'Erreurs & Quotas](/docs?doc=6-erreurs-et-limites) : Gestion des limites et résolution d'incidents.
