---
title: "Licences & Conformité Légale"
description: "Conditions d'utilisation, licences de distribution open-weights et architecture de confidentialité des données."
category: "Guides"
order: 8
---

# Licences, Propriété Intellectuelle & Conformité Légale 

La suite technologique **mDevsLabs** s'appuie sur des principes stricts de souveraineté numérique, de transparence contractuelle et de respect rigoureux de la vie privée de ses utilisateurs et développeurs.

---

## 1. Licences des Modèles & Logiciels

### Modèles Fondamentaux Open-Weights
Nos modèles d'intelligence artificielle souverains (séries `mAI-1.5`, `mAI-1.2`, `mAI-1.0` en déclinaisons *Light*, *Apex* et *Opal*) sont distribués sous licence **Open-Weights** permissive (MIT / Apache 2.0). Cette licence vous accorde le droit :
- D'exécuter et déployer les modèles localement sur vos propres infrastructures physiques ou virtuelles.
- D'intégrer les modèles dans des applications commerciales ou internes sans redevance (*royalty-free*).
- De réaliser des opérations de fine-tuning et d'adaptation de poids sans obligation de divulgation de vos jeux de données propriétaires.

### Outils & Applications de la Suite mAI
Les applications client (mAI Web, mAI Pulse, mAI CLI, mAI Coder) et leurs SDK associés sont protégés par le droit de la propriété intellectuelle et distribués selon les conditions générales de service de **mDevsLabs**.

---

## 2. Hébergement & Répartition Géographique des Données

mDevsLabs applique une gouvernance claire et auditable concernant la localisation et le stockage des informations :

| Type de Données | Localisation Principale | Chiffrement & Conformité |
| :--- | :--- | :--- |
| **Bases de Données & Comptes** | **Union Européenne (UE)**  *(Francfort, Allemagne)* | Chiffrement AES-256 au repos, conformité RGPD intégrale |
| **Clés d'API & Métadonnées d'Usage** | **Union Européenne (UE)**  *(Francfort, Allemagne)* | Hachage SHA-256 irréversible, partitionnement isolé |
| **Fichiers & Cloud Storage (Objets)** | **États-Unis (USA)** & **Afrique du Sud**  *(Infrastructures Cloud S3/Objets)* | Chiffrement AES-256, TLS 1.3, Clauses Contractuelles Types |

> **Clause Obligatoire : Les données et fichiers sont principalement stockés aux États-Unis et en Afrique du Sud, conformément aux dispositions contractuelles et aux politiques de gouvernance des données de mDevsLabs.**

---

## 3. Priorité Absolue au ZDR (Zero Data Retention) sur l'IA

La politique **Zero Data Retention (ZDR)** constitue le pilier fondamental de notre engagement en matière d'intelligence artificielle :

1. **Aucun Réentraînement sur vos Données** : Les requêtes (prompts), pièces jointes, codes sources et réponses générées ne sont **jamais** utilisés pour entraîner, évaluer ou affiner des modèles d'IA, qu'ils soient internes à mDevsLabs ou fournis par des partenaires tiers.
2. **Inférence Stateless en Mémoire Volatile** : Le traitement des requêtes s'effectue exclusivement en mémoire vive (RAM). Dès la restitution du flux de données au client, les vecteurs et mémoires de contexte sont immédiatement et définitivement purgés.
3. **Contrôle et Droit à l'Oubli** : Vous conservez la pleine propriété de l'ensemble de vos contenus générés et disposez d'un droit permanent de suppression de compte et d'historique.

---

## 4. Conditions d'Accès à l'API & Responsabilité

- **Secret des Clés d'API** : Les clés API (`mp-...`) sont personnelles et strictement confidentielles. L'utilisateur est seul responsable des appels effectués avec ses identifiants.
- **Respect de l'Usage Raisonnable (AUP)** : Tout usage malveillant (attaques par déni de service, tentatives de jailbreak agressif, génération de contenus illégaux) entraîne la révocation immédiate de l'accès API.
- **Garanties de Service** : Les quotas et débits sont alloués selon les forfaits souscrits (Free, Plus, Pro, Max).
