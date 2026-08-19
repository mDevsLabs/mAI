---
title: "Auth & Sécurité"
description: "Gestion des jetons JWT, clés d'API, quotas de requêtes et rôles RBAC."
category: "API"
order: 5
---

# Authentification API, Clés API & Contrôle d'Accès 🔐🔑

Ce document détaille les mécanismes de sécurité, les méthodes d'authentification et les politiques de contrôle d'accès pour les API mDevsLabs.

---

## 🔑 Authentification par Clé API (`Bearer Token`)

Toutes les requêtes vers l'API REST mAI doivent contenir l'en-tête HTTP `Authorization` :

```http
Authorization: Bearer mdevs_sk_live_9f8d7c6b5a4e3d2c1b0a
```

---

## 🛡️ Modèle de Contrôle d'Accès Basé sur les Rôles (RBAC)

Les clés API disposent de portées (*scopes*) granulaires :

- `models:read` : Autorise la lecture et la liste des modèles.
- `chat:write` : Autorise la génération de réponses de chat.
- `embeddings:write` : Autorise la vectorisation.
- `admin:*` : Accès complet à la gestion du cluster et des utilisateurs.

---

## ⚡ Limites de Débit (Rate Limiting)

- **Community / Free** : 60 RPM (Requêtes / Min), 100 000 TPM (Tokens / Min)
- **Pro Developer** : 600 RPM, 1 000 000 TPM
- **Enterprise Dedicated** : Illimité

