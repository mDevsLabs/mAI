---
title: "Politique de Confidentialité et de Stockage des Données"
description: "Dispositions juridiques, clauses de confidentialité et répartition géographique du stockage des données et fichiers de l'API mDevsLabs."
category: "Légal"
order: 13
---

# Politique de Confidentialité et de Stockage des Données

## 1. Préambule et Portée Juridique

Le présent document constitue la politique de confidentialité et de gouvernance des données applicable à la suite technologique **mDevsLabs**, dont l'interface de programmation applicative porte la désignation **mAI**, ainsi qu'à l'ensemble des applications, SDK et services associés (mAI Web, mAI Pulse, mAI CLI, mAI Coder, mAI Office). Il est établi conformément aux dispositions générales du droit de la protection des données, aux principes de souveraineté numérique et aux obligations contractuelles souscrites par l'utilisateur lors de la création d'un compte ou de l'obtention d'une clé d'API.

Cette politique s'applique de manière universelle à l'ensemble des tiers intégrateurs, développeurs et utilisateurs finaux, sans distinction de juridiction de résidence, sous réserve des adaptations imposées par le droit local applicables dans certaines régions spécifiques.

---

## 2. Principes Fondamentaux de la Confidentialité

La politique de confidentialité de mDevsLabs repose sur quatre piliers immuables, dont la mise en œuvre est vérifiable par l'analyse du code source et des configurations opérationnelles :

### 2.1. Priorité Absolue au Zero Data Retention (ZDR)

Conformément aux mécanismes implémentés dans le middleware global (`api-middleware.ts`) et aux configurations de l'inférence (`config.ts`), aucun prompt, pièce jointe, code source, réponse générée ou métadonnée de contenu n'est persistant au-delà du traitement immédiat en mémoire volatile (RAM). Dès la restitution du flux au client, les vecteurs de contexte et les mémoires temporaires sont purgeés de manière définitive et irréversible. Aucun réentraînement, évaluation ou affinement de modèle n'est réalisé sur la base des données utilisateur.

### 2.2. Chiffrement de Bout en Bout

Toutes les communications entre le client et l'API sont protégées par le protocole **TLS 1.3** et le chiffrement **HTTPS**. Les données au repos sont sécurisées par un chiffrement de niveau bancaire (**AES-256**). Les clés d'API (`mp-...`) sont stockées avec un hachage **SHA-256** irréversible dans des partitions isolées, assurant la séparation stricte entre les données d'identification et les données de contenu.

### 2.3. Anonymisation Dynamique des Données Personnelles (PII)

Le module de sécurité **mAI-Guard**, intégré au pipeline de traitement des requêtes, procède au masquage en temps réel des données personnelles sensibles (adresses électroniques, identifiants numériques, coordonnées bancaires, données biométriques) avant que ces informations ne soient transmises aux couches d'inférence. Cette anonymisation est opérée au niveau du middleware, avant tout traitement de langage par le modèle.

### 2.4. Contrôle et Droit à l'Oubli

L'utilisateur conserve la pleine propriété de ses contenus générés et dispose d'un droit permanent de suppression de compte, d'historique et de données associées. La suppression déclenche une purge immédiate des entrées de la base relationnelle (`sqlite` / `postgres` via `getDb()`), des références dans les systèmes de stockage cloud et des journaux d'usage agrégés, sous réserve des obligations de conservation légale applicables au niveau de la juridiction de stockage.

---

## 3. Répartition Géographique du Stockage — Clause Obligatoire

Conformément aux dispositions contractuelles, aux exigences de souveraineté numérique et aux politiques de gouvernance des données établies par mDevsLabs, il est expressément stipulé que :

> **Les données et fichiers sont principalement stockés aux États-Unis et en Afrique du Sud.**

Cette répartition s'applique de manière uniforme à l'ensemble des catégories de données traitées par l'API et les services associés, et constitue une clause essentielle des conditions d'utilisation. Les détails par catégorie sont présentés ci-dessous.

### 3.1. Données Structurées et Bases Relationnelles

Les comptes utilisateurs, les profils de tier, les hachages de mots de passe (`bcrypt`, 12 tours), les clés d'API et les métriques d'usage sont conservés dans des infrastructures de base de données relationnelles (PostgreSQL et SQLite) dont les serveurs principaux sont localisés aux **États-Unis** et en **Afrique du Sud**. L'accès est restreint par des mécanismes de partitionnement isolé et de contrôle d'accès au niveau de la ligne (`SELECT ... LIMIT 1` avec hachage de comparaison).

### 3.2. Fichiers et Objets de Stockage Cloud

Les images générées, les exports médias, les documents joints et les objets de stockage utilisateur (limités selon le tier : 500 Mo pour Free, 1 Go pour Plus, 2 Go pour Pro, 5 Go pour Max) sont hébergés dans des infrastructures de stockage objets (S3 / Cloud Storage) situées principalement aux **États-Unis** et en **Afrique du Sud**. L'accès à ces objets est protégé par le chiffrement AES-256 au repos et le transport sécurisé TLS 1.3.

### 3.3. Journalisation et Métadonnées Techniques

Les journaux de sécurité (`mAI-Guard`), les enregistrements d'usage agrégés (`/usage`, `/v1/log-usage`) et les métadonnées d'analyse sont également conservés dans des systèmes de stockage dont la localisation principale se situe aux **États-Unis** et en **Afrique du Sud**. Ces données sont anonymisées et ne contiennent pas le contenu des prompts.

---

## 4. Conformité Règle de Protection des Données (RGPD) et Juridictions
e
Bien que la localisation principale du stockage soit indiquée ci-dessus, mDevsLabs applique des mesures de conformité adaptées aux juridictions dans lesquelles l'utilisateur est établi. Pour les résidents de l'Union Européenne, des clauses contractuelles types sont mises en œuvre afin de garantir un niveau de protection équivalent, tout en respectant la répartition géographique principale du stockage. L'utilisateur est informé de manière expresse que le traitement technique et le stockage principal des données s'effectuent hors de l'espace économique européen, conformément à la clause obligatoire énoncée ci-dessus.

---

## 5. Secret des Identifiants et Responsabilité de l'Utilisateur

Les clés d'API (`mp-...`) sont personnelles, strictement confidentielles et non transférables. L'utilisateur assume la responsabilité exclusive de tout usage effectué au moyen de ses identifiants. Toute divulgation accidentelle ou malveillante entraîne la révocation immédiate des accès et peut entraîner des mesures de restriction ou d'exclusion du service. L'utilisateur est tenu de mettre en œuvre des pratiques de sécurité rigoureuses : stockage des clés dans des gestionnaires de secrets, rotation périodique des credentials et surveillance des logs d'accès.

---

## 6. Politique d'Usage Raisonnable (AUP) et Restrictions

L'utilisation de l'API est soumise à une politique d'usage raisonnable stricte. Tout usage malveillant — notamment les attaques par déni de service (DoS / DDoS), les tentatives d'injection agressive (`Prompt Injection`), la génération de contenus illégaux, la tentative d'extraction d'instructions système (`System Prompt Extraction`) ou toute autre atteinte à l'intégrité du service — entraîne la révocation immédiate et irrévocable de l'accès API. Le module `mAI-Guard` analyse les flux entrants pour neutraliser ces menaces avant leur traitement par les modèles de langage.

---

## 7. Mise à Jour et Version du Document

Le présent document est susceptible d'être mis à jour pour refléter les évolutions de la législation appliquée, les modifications techniques de l'architecture de stockage ou les extensions des services mAI. Toute modification substantielle est notifiée aux utilisateurs via le portail de gestion du compte et via la documentation publique disponible dans le répertoire `@docs/documentation/`. La version en vigueur est celle qui est publiée au moment de la consultation.

---

## 8. Conclusion

La politique de confidentialité et de stockage de mDevsLabs repose sur un équilibre rigoureux entre transparence contractuelle, protection technique avancée et respect des obligations juridiques applicables dans les juridictions concernées. L'utilisateur est informé de manière expresse et sans ambiguïté que **les données et fichiers sont principalement stockés aux États-Unis et en Afrique du Sud**. Cette disposition constitue un élément essentiel de la relation contractuelle et doit être prise en compte dans toute évaluation des risques, de la conformité réglementaire et de la stratégie de souveraineté numérique des intégrateurs et des utilisateurs finaux.
