---
title: "Intégration de l'API mAI dans Claude Code"
description: "Procédure détaillée pour configurer l'agent Claude Code afin qu'il exploite l'API mDevsLabs comme fournisseur de modèle et d'inférence."
category: "Intégration"
order: 12
---

# Intégration de l'API mAI dans Claude Code

## 1. Objet et Portée du Document

Le présent document établit la procédure méthodique permettant de configurer **Claude Code**, l'agent de développement autonome proposé par Anthropic, afin qu'il s'appuie sur l'interface de programmation applicative **mAI** de **mDevsLabs**. Cette intégration vise à orienter le flux de requêtes générées par Claude Code vers les infrastructures mAI tout en respectant les contraintes de protocole, de sécurité et de conformité juridique applicables.

Il convient de préciser dès l'entame que Claude Code a été initialement conçu pour interagir avec l'API Anthropic selon un format de requête spécifique (`/v1/messages`). L'API mAI, quant à elle, se conforme au standard **OpenAI API v1** (`/v1/chat/completions`). Par conséquent, l'intégration requiert soit une adaptation du point d'accès au moyen d'un intermédiaire de traduction de protocole, soit l'utilisation d'une couche de compatibilité intégrée au client Claude Code. Le guide présente la méthode la plus robuste et formellement recommandée.

---

## 2. Prérequis Techniques et Juridiques

Avant de procéder, l'intégrateur doit disposer des éléments suivants :

- Une clé d'API mAI valide, délivrée par le portail mDevsLabs, au format `mp-...`, et associée au tier désiré ;
- L'installation de **Claude Code CLI** dans sa version stable, accessible via le gestionnaire de paquets officiel (`npm install -g @anthropic-ai/claude-code`) ou directement depuis le dépôt de distribution d'Anthropic ;
- Un environnement de terminal permettant la définition de variables d'environnement et la modification des fichiers de configuration du client ;
- Une connaissance préalable des mécanismes d'authentification et de quota exposés dans le guide de fonctionnement de l'API ;
- La prise en connaissance expresse des dispositions juridiques relatives au stockage, rappelant que **les données et fichiers sont principalement stockés aux États-Unis et en Afrique du Sud**, imposant une analyse de conformité pour tout traitement de code source ou de données personnelles par Claude Code.

---

## 3. Principes de l'Architecture d'Intégration

L'architecture recommandée repose sur l'interposition d'une **couche de compatibilité** entre Claude Code et l'API mAI. Cette couche assure la traduction du format de requête Anthropic vers le format OpenAI accepté par mAI, et inversement pour les réponses. Le schéma fonctionnel est le suivant :

```text
Claude Code CLI (Agent Anthropic)
     │
     ├── Config : CLAUDE_API_KEY = mp-votre_cle_mai
     ├── Config : CLAUDE_API_BASE = http://localhost:8000 (proxy LiteLLM)
     │
     ▼
Couche de Compatibilité (LiteLLM / Proxy Intermédiaire)
     │
     ├── Traduction Anthropic → OpenAI
     ├── Route vers https://mai-devs.vercel.app/api/v1
     │
     ▼
API mAI (Hono / Deno — Standard OpenAI v1)
     │
     ├── Authentification (Bearer / x-api-key)
     ├── Vérification des quotas (tier)
     ├── Traitement volatile (ZDR)
     ├── Réponse JSON / SSE
     ▼
Couche de Compatibilité — Traduction inversée
     ▼
Claude Code (Traitement du code et suggestions)
```

Cette architecture préserve l'intégrité du client Claude Code tout en permettant l'exploitation des capacités de génération de code, d'analyse et d'automatisation de l'API mAI.

---

## 4. Mise en Place du Proxy de Compatibilité (Méthode Recomandée)

### 4.1. Installation et Configuration de LiteLLM

Le proxy **LiteLLM** constitue une solution éprouvée permettant d'exposer un endpoint Anthropic-compatible tout en redirigeant les requêtes vers un fournisseur OpenAI-compatible (en l'occurrence, mAI). L'installation s'effectue comme suit :

```bash
# Installation du proxy LiteLLM
pip install litellm

# Ou via un gestionnaire d'environnement virtualisé
python -m venv venv_litellm && source venv_litellm/bin/activate
pip install litellm
```

### 4.2. Fichier de Configuration du Proxy (`proxy_config.yaml`)

Créez un fichier de configuration définissant le fournisseur mAI comme source primaire :

```yaml
model_list:
  - model_name: anthropic/moonshot-v1-8k
    litellm_params:
      model: openai/mAI-1.5
      api_base: https://mai-devs.vercel.app/api/v1
      api_key: mp-votre_cle_mai_ici
```

Dans cet exemple, le nom de modèle est mappé vers une désignation Anthropic-compatible (`anthropic/moonshot...`) tout en poinant vers l'URL de base mAI et en injectant la clé d'authentification appropriée.

### 4.3. Lancement du Proxy

```bash
litellm --config proxy_config.yaml --port 8000
```

Le proxy écoute alors sur `http://localhost:8000` et expose un endpoint compatible avec le protocole Anthropic (`/v1/messages`).

---

## 5. Configuration de Claude Code pour l'Usage du Proxy

### 5.1. Définition des Variables d'Environnement

Dans l'environnement d'exécution de Claude Code, exportez les paramètres suivants :

```bash
export ANTHROPIC_API_KEY="mp-votre_cle_mai_ici"
export CLAUDE_API_BASE="http://localhost:8000"
export CLAUDE_MODEL="anthropic/moonshot-v1-8k"
```

Il est important de noter que la clé API utilisée est celle du tiers mAI (`mp-...`), et que le point d'accès (`CLAUDE_API_BASE`) redirige vers le proxy LiteLLM, et non directement vers `api.anthropic.com`.

### 5.2. Fichier de Configuration Native de Claude Code (`.claude/code/config.json`)

Pour une persistance du paramétrage au niveau du projet, créez ou modifiez le fichier `.claude/code/config.json` :

```json
{
  "api_key": "mp-votre_cle_mai_ici",
  "api_base": "http://localhost:8000",
  "model": "anthropic/moonshot-v1-8k",
  "max_tokens": 4096,
  "temperature": 0.2
}
```

Le fichier doit être protégé par des permissions restrictives (`chmod 600`) et intégré au `.gitignore` du dépôt afin d'éviter tout risque d'exposition des identifiants.

---

## 6. Sélection du Modèle et Paramètres d'Inférence

L'API mAI propose plusieurs modèles adaptés aux tâches de génération de code. Pour Claude Code, la sélection doit tenir compte de la capacité d'inférence contextuelle requise par l'analyse de projets complexes :

- **`mAI-1.5-Apex`** : Modèle de pointe, recommandé pour les bases de code volumineuses et les opérations de refactoring avancées ;
- **`mAI-1.5-Opal`** : Modèle optimisé pour la rapidité d'inférence et les tâches de génération de fonctions ponctuelles ;
- **`mAI-1.5-Light`** : Modèle allégé, adapté aux environnements à contraintes de ressources ou aux analyses de fichiers isolés.

Dans la configuration du proxy LiteLLM, ces modèles sont mappés selon la syntaxe :

```yaml
model_list:
  - model_name: anthropic/moonshot-v1-8k
    litellm_params:
      model: openai/mAI-1.5-Apex
      api_base: https://mai-devs.vercel.app/api/v1
      api_key: mp-votre_cle_mai_ici
```

---

## 7. Gestion des Quotas et Surveillance de la Consommation

Comme dans le cas de Codex, Claude Code consomme le quota du tier associé à la clé API mAI. L'intégrateur doit mettre en place un suivi rigoureux :

1. **Surveillance des requêtes** : Interroger régulièrement `https://mai-devs.vercel.app/api/v1/usage` pour obtenir le nombre de requêtes et de tokens consommés ;
2. **Contrôle du streaming** : Si Claude Code requiert un flux continu de réponses, s'assurer que le proxy LiteLLM transmet correctement les événements `data: ` du protocole SSE vers le client Claude ;
3. **Respect des limites de tier** : Ne pas dépasser 500 requêtes quotidiennes (Free), 1 000 (Plus), 2 000 (Pro) ou 5 000 (Max). Un dépassement entraîne une réponse d'erreur `429` et la suspension temporaire du service ;
4. **Journalisation des usages** : Activer le module `log-usage` si le proxy le permet, afin de conserver un audit des traversées d'API sans exposer le contenu des prompts.

---

## 8. Protocole de Sécurité et Conformité Juridique

Le traitement des données via Claude Code et l'intermédiaire LiteLLM doit respecter strictement les dispositions juridiques applicables, notamment :

- **Localisation du stockage** : **Les données et fichiers sont principalement stockés aux États-Unis et en Afrique du Sud**. Toute données sensible du projet traitée par Claude Code transite par ces juridictions ;
- **Politique Zero Data Retention (ZDR)** : Le contenu des prompts et des réponses n'est pas persistant au-delà du traitement volontaire en mémoire RAM ;
- **Chiffrement et transport** : Toutes les communications entre Claude Code, le proxy LiteLLM et l'API mAI doivent obligatoirement utiliser HTTPS (TLS 1.3) ;
- **Protection des identifiants** : La clé `mp-...` doit être injectée via un gestionnaire de secrets (HashiCorp Vault, AWS Secrets Manager) et non stockée en clair dans le dépôt de code ;
- **Anonymisation PII** : Le module `mAI-Guard` analyse automatiquement les flux pour masquer les données personnelles sensibles durant le traitement.

---

## 9. Vérification, Tests et Dépannage

Avant d'utiliser Claude Code en production avec l'API mAI, il est recommandé d'exécuter la séquence de vérification suivante :

```bash
# Test de la connexion au proxy LiteLLM
curl -X POST http://localhost:8000/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: mp-votre_cle_mai_ici" \
  -d '{
    "model": "anthropic/moonshot-v1-8k",
    "max_tokens": 100,
    "messages": [{"role":"user","content":"Bonjour, test de connexion."}]
  }'

# Test direct sur l'API mAI (sans proxy) pour validation du endpoint
curl -s -X POST https://mai-devs.vercel.app/api/v1/chat/completions \
  -H "Authorization: Bearer mp-votre_cle_mai_ici" \
  -H "Content-Type: application/json" \
  -d '{
    "model":"mAI-1.5",
    "messages":[{"role":"user","content":"Test."}],
    "temperature":0.2
  }'
```

En cas d'échec, la procédure de diagnostic s'applique :

| Symptôme | Cause Probable | Remède |
| :--- | :--- | :--- |
| `Connection refused` (proxy) | LiteLLM non lancé ou port incorrect. | Vérifier `litellm --port 8000`, s'assurer que le processus est actif (`lsof -i :8000`). |
| `401 Unauthorized` (mAI) | Clé API incorrecte ou header mal formaté. | Vérifier la clé, s'assurer de l'absence d'espaces, utiliser le format exact `Bearer`. |
| `404 Not Found` | Endpoint Anthropic non reconnu par LiteLLM. | Vérifier que le proxy est configuré pour `api_base` correct et que le modèle est bien mappé. |
| Réponse incohérente | Traduction de protocole incomplète. | Mettre à jour LiteLLM vers la dernière version stable et vérifier la compatibilité du modèle mappé. |

---

## 10. Exemple Complet d'Intégration

L'exemple ci-dessous illustre la mise en œuvre intégrale dans un environnement de développement :

```bash
# 1. Lancement du proxy LiteLLM en arrière-plan
nohup litellm --config /chemin/proxy_config.yaml --port 8000 > proxy.log 2>&1 &

# 2. Exportation des variables Claude Code
export ANTHROPIC_API_KEY="mp-votre_cle_mai_ici"
export CLAUDE_API_BASE="http://localhost:8000"

# 3. Lancement de Claude Code avec le modèle mAI
claude-code --model anthropic/moonshot-v1-8k --full-auto

# 4. Vérification de la consommation après session
curl -s -H "Authorization: Bearer mp-votre_cle_mai_ici" \
  https://mai-devs.vercel.app/api/v1/usage
```

Dans ce scénario, Claude Code traite le code du projet, génère des suggestions et effectue des opérations d'automatisation tout en s'appuyant sur les infrastructures mAI, avec une traduction protocolaire transparente et une conformité aux dispositions juridiques relatives au stockage des données.

---

## 11. Conclusion et Recommandations

L'intégration de l'API mAI dans Claude Code est réalisable de manière robuste par l'interposition d'une couche de compatibilité, principalement au moyen du proxy LiteLLM. Cette approche respecte l'architecture native du client Anthropic tout en permettant l'exploitation complète des fonctionnalités de la suite mDevsLabs. L'intégrateur est tenu de respecter rigoureusement la confidentialité des identifiants, la surveillance des quotas et la prise en compte des lieux de stockage des données. Une maintenance régulière du proxy, une mise à jour des modèles mappés et un audit des usages garantiront la stabilité et la conformité de l'intégration au long terme.
