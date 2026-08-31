---
title: "Intégration de l'API mAI dans OpenAI Codex"
description: "Procédure détaillée pour configurer l'agent de codage Codex afin d'utiliser l'API mDevsLabs comme fournisseur de modèle principal."
category: "Intégration"
order: 11
---

# Intégration de l'API mAI dans OpenAI Codex

## 1. Objet et Portée du Document

Le présent guide établit la procédure formelle et exhaustive permettant de configurer **OpenAI Codex**, l'agent d'ingénierie logicielle autonome développé par OpenAI, afin qu'il s'appuie sur l'interface de programmation de la suite **mDevsLabs** (API mAI) comme source de modèles de langage et de traitement du code. Cette intégration vise à substituer ou à compléter le point d'accès par défaut (`api.openai.com`) par la plateforme mAI tout en conservant la compatibilité fonctionnelle au standard OpenAI API v1.

Il est impératif de souligner que l'intégration s'effectue au niveau de la configuration client, sans modification du modèle de base de Codex ni altération de ses mécanismes internes de génération de code.

---

## 2. Prérequis Techniques et Juridiques

Avant de procéder à l'intégration, l'intégrateur doit s'assurer du respect des conditions préalables suivantes :

- Possession d'une clé d'API mAI valide (format `mp-...`) délivrée par le portail mDevsLabs, associée au tier souhaité (Free, Plus, Pro, Max) ;
- Acquisition d'une clé d'accès OpenAI Codex (si l'environnement requiert une authentification hybride) ou utilisation du mode autonome de Codex CLI ;
- Installation de **Codex CLI** dans sa version la plus récente, disponible via le gestionnaire de paquets (`npm install -g @openai/codex`) ou via le dépôt officiel d'OpenAI ;
- Accès à un environnement de terminal compatible avec les variables d'environnement et la modification des fichiers de configuration JSON ;
- Lecture préalable des documents juridiques applicables, rappelant que **les données et fichiers sont principalement stockés aux États-Unis et en Afrique du Sud** imposant une analyse de conformité pour les données traitées par Codex.

---

## 3. Architecture de l'Intégration

Codex communique avec les modèles de langage par le biais d'une interface HTTP standardisée. Par défaut, le client pointe vers `https://api.openai.com/v1/`. Pour rediriger le trafic vers l'API mAI, il convient de remplacer l'URL de base tout en conservant le chemin relatif des endpoints (`/v1/chat/completions`, `/v1/models`, etc.).

L'architecture de redirection est la suivante :

```text
Codex CLI / Agent Codex
     │
     ├── Config : OPENAI_BASE_URL = https://mai-devs.vercel.app/api
     ├── Config : OPENAI_API_KEY = mp-... (clé mAI)
     ├── Config : MODEL = mAI-1 / mAI-1.5 / mAI-1.2 / etc.
     │
     ▼
Serveur mAI (Hono / Deno)
     │
     ├── Middleware d'authentification (Bearer / x-api-key)
     ├── Vérification des quotas par tier
     ├── Traitement en mémoire volatile (ZDR)
     ├── Réponse JSON ou SSE
     ▼
Codex (traitement du code généré)
```

---

## 4. Procédure d'Configuration Étape par Étape

### 4.1. Définition des Variables d'Environnement

Le moyen le plus direct consiste à exporter les paramètres dans l'environnement d'exécution du terminal avant le lancement de Codex :

```bash
# Exportation des variables pour la session en cours
export OPENAI_BASE_URL="https://mai-devs.vercel.app/api/v1"
export OPENAI_API_KEY="mp-votre_cle_mai_ici"
export OPENAI_MODEL="mAI-1.5"
```

Pour une persistance au-delà de la session, il est recommandé d'intégrer ces déclarations dans le fichier `.env` du projet ou dans le profil de shell (`.bashrc`, `.zshrc`, `.profile`) selon le système d'exploitation en vigueur.

### 4.2. Fichier de Configuration de Codex (`.codex/config.json`)

Codex accepte un fichier de configuration local permettant de surcharger les paramètres globaux du client. Créez ou modifiez le fichier situé dans le répertoire racine du projet ou dans le dossier de configuration utilisateur :

```json
{
  "baseUrl": "https://mai-devs.vercel.app/api/v1",
  "apiKey": "mp-votre_cle_mai_ici",
  "model": "mAI-1.5",
  "temperature": 0.2,
  "maxTokens": 4096,
  "stream": false
}
```

Il est essentiel de veiller à la confidentialité de ce fichier, car il contient la clé API, laquelle doit être protégée conformément aux instructions juridiques applicables et aux clauses relatives au secret des identifiants.

### 4.3. Configuration du Fichier `.env` au Niveau du Projet

Pour les équipes travaillant sur un dépôt partagé, il est préférable d'utiliser un fichier `.env` distinct, exclu du système de contrôle de versions (`.gitignore`), et d'y déclarer :

```env
OPENAI_BASE_URL=https://mai-devs.vercel.app/api/v1
OPENAI_API_KEY=mp-votre_cle_mai_ici
MAI_MODEL=mAI-1.5
```

Le lancement de Codex s'effectue alors par la commande :

```bash
codex --env-file .env --model mAI-1.5
```

---

## 5. Sélection du Modèle et Compatibilité des Endpoints

L'API mAI propose plusieurs déclinaisons de modèles, notamment :

- `mAI-1` (modèle fondamental de base) ;
- `mAI-1.2` (déclinaisons *Light*, *Apex*, *Opal*) ;
- `mAI-1.5` (déclinaisons *Light*, *Apex*, *Opal*) ;
- `mAI-embeddings` pour le calcul des vecteurs sémantiques.

Pour les opérations de génération de code au sein de Codex, il est recommandé d'utiliser le modèle `mAI-1.5` (ou `mAI-1.5-Apex` selon la complexité du projet), en raison de sa capacité d'inférence avancée et de son alignement avec le format de réponse OpenAI. Les endpoints compatibles sont :

- `/v1/chat/completions` (génération conversationnelle et de code) ;
- `/v1/models` (consultation des modèles disponibles) ;
- `/v1/embeddings` (si Codex requiert une indexation sémantique du contexte).

---

## 6. Gestion des Quotas et Surveillance de la Consommation

Du fait de la substitution du fournisseur, Codex consomme désormais le quota du tier mAI associé à la clé API. L'intégrateur doit impérativement :

1. Consulter régulièrement le tableau de bord d'utilisation (`/usage` ou `/v1/usage`) pour suivre la consommation en tokens et en requêtes ;
2. Configurer le paramètre `maxTokens` de Codex afin de ne pas dépasser les limites journalières de requêtes allouées au tier (500 pour Free, 1 000 pour Plus, 2 000 pour Pro, 5 000 pour Max) ;
3. Activer le mode `stream: false` si la stabilité du flux est prioritaire, ou conserver `stream: true` si la réactivité est requise, en veillant à ce que le middleware mAI supporte pleinement le protocole SSE.

---

## 7. Protocole de Sécurité et Confidentialité des Données Traitées par Codex

Il est rappelé expressément que **les données et fichiers sont principalement stockés aux États-Unis et en Afrique du Sud**. Par conséquent, l'intégrateur de Codex doit prendre en compte les éléments suivants :

- Les sources de code analysées par Codex, ainsi que les réponses générées, transitent par les infrastructures mAI situées dans ces juridictions ;
- La politique **Zero Data Retention (ZDR)** s'applique : aucun contenu n'est persistant au-delà du traitement volatile en mémoire ; toutefois, la localisation géographique du traitement doit être intégrée dans l'évaluation des risques ;
- Les clés d'API doivent être stockées dans des gestionnaires de secrets (Vault, AWS Secrets Manager, Azure Key Vault) et non dans le code source du projet, afin de prévenir toute exposition accidentelle ;
- Les échanges doivent obligatoirement utiliser le protocole HTTPS (TLS 1.3) et aucune clé d'API ne doit être transmise par un canal non sécurisé.

---

## 8. Vérification et Dépannage (Troubleshooting)

En cas d'échec de connexion ou de génération incorrecte, l'intégrateur doit procéder selon la méthodologie ci-dessous :

| Symptôme | Cause Probable | Remède |
| :--- | :--- | :--- |
| Erreur `401 Unauthorized` | Clé API invalide ou expirée, ou header mal formé. | Vérifier le format `Bearer mp-...`, s'assurer de l'absence d'espaces superflus, renouveler la clé si nécessaire. |
| Erreur `429 Too Many Requests` | Dépassement du quota journalier du tier. | Consulter `/usage`, attendre la réinitialisation du quota (cycle journalier) ou passer à un tier supérieur. |
| Réponse vide ou erreur de modèle | Nom de modèle inexistant ou mal orthographié. | Vérifier la liste des modèles via `/v1/models` et utiliser une désignation exacte (`mAI-1.5`). |
| Flux interrompu (SSE) | Incompatibilité du client avec le format d'événement mAI. | Désactiver le streaming (`stream: false`) ou mettre à jour Codex CLI vers la dernière version stable. |

---

## 9. Exemple Complet d'Exécution

L'exemple ci-dessous illustre l'intégration complète dans un terminal :

```bash
# 1. Exportation des paramètres
export OPENAI_BASE_URL="https://mai-devs.vercel.app/api/v1"
export OPENAI_API_KEY="mp-exemple_cle_12345"
export OPENAI_MODEL="mAI-1.5"

# 2. Vérification de la connexion
curl -s -H "Authorization: Bearer $OPENAI_API_KEY" \
  "$OPENAI_BASE_URL/models" | head -c 500

# 3. Lancement de Codex avec le modèle mAI
codex --model mAI-1.5 --full-auto --approval-mode "suggest"
```

Dans cet exemple, Codex utilisera le modèle mAI-1.5 pour toutes les opérations d'analyse du code, de suggestion de modifications et de génération de fonctions, tout en respectant la politique de confidentialité et de stockage définie par mDevsLabs.

---

## 10. Conclusion et Recommandations

L'intégration de l'API mAI dans OpenAI Codex constitue une substitution technique directe et conforme au standard industriel OpenAI API v1. Elle requiert une attention particulière à la configuration des variables d'environnement, au choix du modèle adéquat, au respect des quotas de tier et à la prise en compte des dispositions juridiques relatives au stockage des données. L'intégrateur est vivement invité à consulter régulièrement les mises à jour de la documentation technique et à maintenir un audit des consommations afin d'assurer la pérennité et la performance du système intégré.
