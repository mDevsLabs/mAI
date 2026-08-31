---
title: "Conditions Générales d'Utilisation et Inventaire des Obligations Légales"
description: "Conditions contractuelles applicables à l'utilisation de l'API mAI, aux licences de modèles et aux responsabilités réciproques, avec mention expresse du stockage géographique des données."
category: "Légal"
order: 14
---

# Conditions Générales d'Utilisation

## 1. Préambule et Définition des Parties

Le présent document constitue les conditions générales d'utilisation applicables à la suite technologique **mDevsLabs**, dont l'API porte la désignation commerciale **mAI**, ainsi qu'à l'ensemble des applications, interfaces de programmation, SDK et outils de développement distribués sous l'autorité de mDevsLabs. Par « Utilisateur », il faut entendre toute personne physique ou morale qui accède à l'API, obtient une clé d'authentification, télécharge un SDK ou utilise un service associé. Par « Fournisseur », il faut entendre l'entité juridique exploitant l'infrastructure, la base de données et l'ensemble des modèles de langage distribués sous licence ouverte ou propriétaire.

Les présentes conditions sont établies sur la base d'une analyse rigoureuse du code source, des configurations opérationnelles (`config.ts`, `auth.ts`, `api-middleware.ts`) et des spécifications techniques documentées dans le répertoire `docs/documentation/` du projet. Elles s'imposent de plein droit dès la première connexion, la première requête API ou l'installation d'un composant logiciel.

---

## 2. Acceptation et Entrée en Vigueur

L'utilisation de l'API et de ses services associés implique l'acceptation intégrale et sans réserve des présentes conditions. Toute utilisation, même partielle, constitue une reconnaissance expresse des obligations et des garanties réciproques énoncées ci-dessous. L'utilisateur qui refuse tout ou partie des conditions doit immédiatement cessera tout accès au système et supprimer toute clé d'API obtenue.

---

## 3. Licence des Modèles et des Logiciels

### 3.1. Modèles Fondamentaux Open-Weights

Les modèles d'intelligence artificielle souverains distribués par mDevsLabs — séries `mAI-1`, `mAI-1.2` (déclinaisons *Light*, *Apex*, *Opal*) et `mAI-1.5` (déclinaisons *Light*, *Apex*, *Opal*) — sont mis à la disposition des utilisateurs sous licence **Open-Weights** permissive, compatible avec les termes **MIT** et **Apache 2.0**. Cette licence confère à l'utilisateur les droits suivants :

- Exécuter et déployer les modèles localement sur des infrastructures physiques ou virtuelles propres ;
- Intégrer les modèles dans des applications commerciales ou internes sans obligation de redevance (*royalty-free*) ;
- Réaliser des opérations de fine-tuning et d'adaptation des poids sans obligation de divulgation des jeux de données propriétaires.

### 3.2. Applications et SDK Associés

Les applications clientes (mAI Web, mAI Pulse, mAI CLI, mAI Coder, mAI Office) et leurs SDK (TypeScript, Python) sont protégés par le droit de la propriété intellectuelle et distribués selon les conditions générales de service de mDevsLabs. Toute reproduction, modification ou redistribution non autorisée est strictement interdite et peut entraîner des poursuites civiles et pénales.

---

## 4. Répartition Géographique du Stockage — Clause Expresse

Conformément aux dispositions contractuelles, aux exigences de gouvernance des données et aux politiques de transparence applicables, il est établi de manière expresse et sans ambiguïté que :

> **Les données et fichiers sont principalement stockés aux États-Unis et en Afrique du Sud.**

Cette clause s'applique de manière universelle et indifférenciée à toutes les catégories de données traitées par l'API, y compris mais sans s'y limiter : les données structurées des comptes et profils, les fichiers et objets de stockage cloud, les clés d'API et métadonnées d'usage, ainsi que les journaux techniques sécurisés. La répartition géographique est un élément essentiel du consentement contractuel et doit être prise en compte dans toute évaluation de conformité, de souveraineté numérique et de gestion des risques par l'utilisateur et par tout tiers intégrateur.

---

## 5. Conditions d'Accès à l'API et Responsabilité

### 5.1. Secret des Clés d'API

Les clés d'API (`mp-...`) sont personnelles, strictement confidentielles et non transférables. L'utilisateur est seul et exclusivement responsable des appels effectués au moyen de ses identifiants, y compris ceux réalisés par des tiers ayant obtenu un accès indirect. Toute division, partage ou exposition accidentelle de la clé entraîne la révocation immédiate de l'accès et la responsabilité de l'utilisateur pour tout préjudice subi par le Fournisseur ou par d'autres utilisateurs.

### 5.2. Respect de l'Usage Raisonnable (AUP)

L'utilisateur s'engage à utiliser l'API dans le strict respect de la politique d'usage raisonnable. Sont strictement interdits : les attaques par déni de service (DoS / DDoS), les tentatives de jailbreak agressif, la génération de contenus illégaux, la tentative d'extraction d'instructions système (`Prompt Injection`, `System Prompt Extraction`), l'exfiltration de données non autorisée et toute autre action susceptible de porter atteinte à l'intégrité, à la disponibilité ou à la sécurité du service. Le non-respect de ces obligations entraîne la révocation immédiate et irrévocable de l'accès API, sans préjudice des actions judiciaires que le Fournisseur pourrait engager.

### 5.3. Garanties de Service et Quotas

Les quotas et débits sont alloués selon le tier souscrit (Free, Plus, Pro, Max) et sont définis de manière publique dans le référentiel de configuration (`config.ts`). L'utilisateur reconnaît que ces limites sont absolues et qu'aucune dérogation n'est accordée hors du mécanisme d'augmentation de tier. En cas de dépassement du quota journalier, l'API renvoie une réponse d'erreur `429 Too Many Requests` et suspend temporairement le traitement des requêtes jusqu'à la réinitialisation du cycle.

---

## 6. Architecture de Confidentialité et Protection des Données

Le Fournisseur s'engage à appliquer les mesures techniques et organisationnelles suivantes, dont la mise en œuvre est vérifiable par inspection du code source et des configurations système :

- **Zero Data Retention (ZDR)** : Aucune persistance des prompts, réponses et contenus générés au-delà du traitement en mémoire volatile ;
- **Isolation des données** : Partitionnement des bases relationnelles (`sqlite` / `postgres`) et des systèmes de stockage cloud ;
- **Anonymisation dynamique** : Masquage des PII par le module `mAI-Guard` au niveau du middleware (`api-middleware.ts`) ;
- **Chiffrement AES-256 au repos et TLS 1.3 en transit** : Protection complète des données dans leur stockage principal aux **États-Unis** et en **Afrique du Sud** ;
- **Contrôle d'accès basé sur les rôles** : Les requêtes sont authentifiées via `timingSafeEqual` et les permissions sont évaluées par tier (`TIER_LIMITS`, `TIER_REQUEST_LIMITS`).

---

## 7. Limitation de Responsabilité et Exonération

Dans la limite autorisée par la loi applicable, le Fournisseur ne saurait être tenu pour responsable des dommages directs, indirects, consécutifs ou spéciaux résultant de l'utilisation de l'API, y compris mais sans s'y limiter : les erreurs de génération de contenu, les interruptions de service liées à la maintenance, les dépassements de quota dus à une mauvaise gestion de l'utilisateur, ou toute perte de données résultant de la non-conformité aux procédures de sauvegarde recommandées. L'utilisateur assume pleinement le risque lié au traitement de données dans les juridictions de stockage indiquées.

---

## 8. Droit Applicable et For Compétent

Le présent document est régi par le droit applicable à la juridiction de la siège social du Fournisseur, sous réserve des règles de conflit de lois et des dispositions impératives du droit de la protection des données de l'utilisateur. En cas de litige relatif à l'interprétation, à la validité ou à l'exécution des conditions, les parties s'engagent à rechercher une solution amiable avant l'engagement de toute procédure contentieuse. À défaut d'accord, le tribunal compétent est celui du siège du Fournisseur.

---

## 9. Mise à Jour et Notification

Le Fournisseur se réserve le droit de modifier les présentes conditions à tout moment, sous réserve d'une notification préalable et d'une publication dans le répertoire de documentation public (`docs/documentation/`). Toute utilisation continue de l'API après publication de la version révisée constitue une acceptation implicite des nouvelles dispositions. L'utilisateur est tenu de consulter régulièrement les documents juridiques applicables et d'intégrer la clause relative au stockage géographique des données dans sa politique interne de gouvernance.

---

## 10. Conclusion et Reconnaissance Contractuelle

Par la présente, l'utilisateur reconnaît avoir pris connaissance de l'ensemble des conditions générales d'utilisation, d'avoir compris la portée des obligations réciproques, et d'avoir été informé de manière expresse que **les données et fichiers sont principalement stockés aux États-Unis et en Afrique du Sud**. Cette reconnaissance constitue un élément essentiel du consentement contractuel et conditionne l'accès maintenu au service. L'utilisateur s'engage à agir avec diligence, transparence et conformité dans l'ensemble de ses interactions avec l'API mAI et ses services associés.
