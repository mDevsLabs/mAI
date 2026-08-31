---
title: "Guide Complet du Fonctionnement de l'API mAI"
description: "Analyse approfondie des configurations, architectures et mécanismes internes de l'API mDevsLabs fondée sur l'examen du code source."
category: "API"
order: 10
---

# Guide Complet du Fonctionnement de l'API mAI

## 1. Introduction et Portée de l'Analyse

Le présent document constitue une synthèse formelle et exhaustive des mécanismes de fonctionnement de l'interface de programmation applicative (API) de la suite **mDevsLabs**, désignée sous l'appellation commerciale **mAI**. Cette analyse repose sur l'examen méthodique du code source du projet, notamment des fichiers de configuration (`config.ts`), des routes d'authentification (`auth.ts`), du middleware global (`api-middleware.ts`) et des spécifications REST existantes. L'objectif est d'offrir aux développeurs, architectes système et intégrateurs une compréhension rigoureuse des paramètres de contrôle, des limites de service et des protocoles de sécurité applicables.

---

## 2. Architecture Générale et Stack Technique

L'API repose sur une architecture distribuée et stateless, construite autour du framework **Hono** (`npm:hono@4`) et exécutée dans un environnement serveur compatible avec la norme **Deno** / **Node.js**. Les requêtes sont traitées via un middleware unifié qui assure simultanément la détection des routes d'API, l'extraction des credentials, la vérification des quotas et la journalisation des flux.

Le point d'entrée public est accessible via le domaine `https://mai-devs.vercel.app/`, avec des variantes locales (`localhost:11434`) pour les déploiements en environnement de développement. L'ensemble des réponses respecte le standard de sérialisation **JSON**, avec prise en charge des flux de tokens en temps réel (**Server-Sent Events**, SSE) pour les opérations de génération textuelle.

---

## 3. Analyse des Configurations Fondamentales (`config.ts`)

Le fichier `config.ts` constitue le référentiel de contrôle unique (**Single Source of Truth**, SSOT) pour les paramètres globaux du système. Les éléments critiques sont détaillés ci-dessous.

### 3.1. Paramètres d'Authentification et de Cryptographie

| Paramètre | Valeur / Expression | Signification Fonctionnelle |
| :--- | :--- | :--- |
| `JWT_EXPIRY` | `"14d"` | Durée de validité des jetons d'accès (tokens JWT) émis lors de la connexion ou de l'inscription. |
| `BCRYPT_ROUNDS` | `12` | Nombre d'itérations de l'algorithme Bcrypt appliqué au hachage des mots de passe dans la base relationnelle. |

Le système de signature de jetons (`signToken`) et de vérification (`verifyToken`) s'appuie sur la bibliothèque `npm:jose`. Les tokens contiennent l'identifiant utilisateur (`sub`) et le niveau d'abonnement (`tier`). La verification s'effectue de manière asynchrone sur chaque requête authentifiée traversant le middleware API.

### 3.2. Structure des Tières et Limites d'Usage

Le modèle économique de l'API est structuré autour de quatre niveaux d'abonnement : **Free**, **Plus**, **Pro**, **Max**. Chaque tier dispose de quotas spécifiques définis par des constantes typées (`Record<string, number>`).

**Limites hebdomadaires de tokens (Entrée + Sortie)** :

| Tier | Limite (tokens) |
| :--- | :--- |
| Free | 2 000 000 |
| Plus | 5 000 000 |
| Pro | 10 000 000 |
| Max | 20 000 000 |

**Limites hebdomadaires de synthèse vocale (Speech)** :

| Tier | Limite (tokens) |
| :--- | :--- |
| Free / Gratuit | 20 000 000 |
| Plus | 50 000 000 |
| Pro | 100 000 000 |
| Max | 200 000 000 |

**Limites de requêtes quotidiennes** :

| Tier | Requêtes / jour |
| :--- | :--- |
| Free | 500 |
| Plus | 1 000 |
| Pro | 2 000 |
| Max | 5 000 |

**Limites quotidiennes de génération d'images** :

| Tier | Images / jour |
| :--- | :--- |
| Free / Gratuit | 3 |
| Plus | 5 |
| Pro | 10 |
| Max | 20 |

**Coût en requêtes API par génération d'image** (mécanisme de déduction de quota) :

| Tier | Requêtes consommées / image |
| :--- | :--- |
| Free | 100 |
| Plus | 50 |
| Pro | 25 |
| Max | 10 |

**Limites de stockage cloud (objets)** :

| Tier | Espace alloué |
| :--- | :--- |
| Free | 500 Mo |
| Plus | 1 Go |
| Pro | 2 Go |
| Max | 5 Go |

Les limites sont interprétées de manière insensible à la casse (`toLowerCase().trim()`), permettant la compatibilité des clés d'accès indépendamment du format de saisie.

---

## 4. Mécanismes d'Authentification et de Vérification (`auth.ts` et `api-middleware.ts`)

L'authentification de l'API s'effectue selon trois modalités acceptées simultanément par le middleware global (`api-middleware.ts`) :

1. **En-tête `Authorization`** au format `Bearer <token>` ;
2. **En-tête `x-api-key`** (ou variantes `X-Api-Key`, `x-goog-api-key`, `X-Goog-Api-Key`) ;
3. **Paramètre de requête `api_key`** (ou `key`).

Le middleware procède dans cet ordre de priorité : extraction du jeton brut, nettoyage des valeurs invalides (`""`, `"null"`, `"undefined"`, `"Bearer"`), puis résolution du plan utilisateur (`userPlan`) et de l'identifiant (`currentUserId`). Le système compare la clé API présentée à un référentiel interne via une fonction de comparaison à temps constant (`timingSafeEqual`) afin d'éviter les attaques par analyse temporelle.

Le middleware distingue également les **routes publiques** (`isPublicRoute`) — notamment `/v1/models`, `/v1/status`, les endpoints de modèles d'images, de parole et d'audio — des routes protégées nécessitant un credential valide.

La base de données relationnelle (SQLite / PostgreSQL via `getDb()`) stocke les profils utilisateurs, leurs mots de passe hachés (`bcrypt` avec 12 tours), leur niveau d'abonnement (`tier`), et leurs données d'usage au niveau agrégé.

---

## 5. Endpoints Principaux et Flux de Traitement

Le middleware détecte automatiquement les routes appartenant au domaine API (`path.startsWith("/v1/")`, `/v1beta/`, `/chat/`, `/images/`, `/speech/`, `/audio/`, `/usage/`, `/mj/`, `/web/search`, etc.). Les opérations principales sont les suivantes :

- **`POST /v1/chat/completions`** : Génération de réponses textuelles avec support du streaming (SSE). Compatible avec le standard OpenAI.
- **`POST /v1/embeddings`** : Calcul de vecteurs de plongement sémantique (embeddings).
- **`GET /v1/models`** : Liste des modèles actuellement chargés et disponibles.
- **`POST /images/generations`** / **`/mj/`** : Génération d'images statiques ou via le modèle Midjourney intégré.
- **`POST /audio/speech`** / **`/speech/`** : Synthèse vocale et reconnaissance vocale.
- **`GET /usage`** / **`/v1/usage`** : Consultation des métriques d'utilisation (tokens, requêtes, images) par utilisateur.
- **`GET /v1/web/search`** : Accès aux fonctions de recherche web intégrées.

Pour chaque requête, le middleware calcule le temps d'exécution (`startTime`), applique les quotas adaptés au tier détecté et transmet la requête au contrôleur de route spécifique.

---

## 6. Politiques de Sécurité, Chiffrement et Confidentialité

Le système applique un ensemble de garanties de sécurité de haut niveau :

- **Chiffrement au repos** : Données stockées avec chiffrement AES-256.
- **Chiffrement en transit** : Protocoles TLS 1.3 et HTTPS obligatoires.
- **Politique Zero Data Retention (ZDR)** : Aucune persistance des prompts, réponses générées ou pièces jointes au-delà du traitement en mémoire volatile (RAM). Purge immédiate après diffusion du flux.
- **Module mAI-Guard** : Filtrage en temps réel des tentatives d'injection de directives (`Prompt Injection`), des contournements de contraintes (`Jailbreak`) et des exfiltrations d'instructions système.
- **Anonymisation dynamique des PII** : Masquage en temps réel des données personnelles sensibles dans les flux.

Le middleware intègre également des mécanismes de journalisation sécurisée (`log-usage`) permettant l'audit des consommations sans exposition des contenus sensibles.

---

## 7. Répartition du Stockage et Gouvernance des Données

Conformément aux politiques juridiques applicables, la gouvernance du stockage des données et des fichiers est définie comme suit :

- **Données structurées et comptes utilisateurs** : Stockage principal dans des infrastructures situées aux **États-Unis** et en **Afrique du Sud**, avec chiffrement AES-256 et conformité aux clauses contractuelles types.
- **Fichiers et objets de stockage cloud (images, exports, médias)** : Stockage principal dans des infrastructures situées aux **États-Unis** et en **Afrique du Sud**, sous protection par chiffrement AES-256 au repos et transport sécurisé TLS 1.3.
- **Bases relationnelles et clés d'API** : Prise en charge par des systèmes de base de données relationnelles (PostgreSQL / SQLite) avec partitionnement isolé.

Il est impératif de noter que toute intégration de l'API et tout traitement de données doivent tenir compte de cette répartition géographique, en particulier pour les exigences de souveraineté numérique et de conformité réglementaire propres aux juridictions concernées.

---

## 8. Guide d'Intégration — Principes Généraux

Pour intégrer l'API mAI dans une application tiers, le développeur doit respecter la procédure type ci-dessous :

1. **Obtenir une clé d'API valide** (`mp-...`) via le portail utilisateur, avec sélection du tier approprié.
2. **Configurer le point d'entrée** : `https://mai-devs.vercel.app/api/v1/` (ou le domaine personnalisé / local).
3. **Définir l'en-tête d'autorisation** : `Authorization: Bearer <votre_cle_api>`.
4. **Formuler la requête** selon le format JSON conforme au standard OpenAI (`model`, `messages`, `temperature`, `stream`, etc.).
5. **Gérer la réponse** : Traitement du JSON standard ou du flux SSE selon la valeur du paramètre `stream`.
6. **Surveiller la consommation** via les endpoints `/usage` et respecter scrupuleusement les quotas définis par tier.

Le système supporte également des SDK spécialisés (TypeScript, Python) permettant une abstraction des appels REST et une gestion automatique des tokens d'authentification.

---

## 9. Conclusion

L'API mAI constitue une interface de programmation robuste, sécurisée et entièrement documentée, fondée sur une architecture stateless, des mécanismes de cryptographie avancée et une gouvernance stricte des données. L'analyse du code source révèle une conception attentive aux exigences de conformité, de performance et de transparence contractuelle. Les intégrateurs sont invités à consulter les guides spécifiques d'intégration dans **OpenAI Codex** et **Claude Code**, ainsi que les documents juridiques relatifs au stockage des données, pour une mise en œuvre complète et conforme.
