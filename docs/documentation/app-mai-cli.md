---
title: "mAI CLI"
description: "Guide d'installation, providers personnalisés (BYOK) et fonctionnalités d'agents pour mAI CLI."
category: "Applications"
order: 1.5
---

# mAI CLI - L'assistant IA natif de votre terminal 💻✨

**mAI CLI** (`mai`) est un outil de développement assisté par intelligence artificielle conçu par mDevsLabs pour s'intégrer nativement dans votre terminal. Gratuit, ouvert et centré sur la confidentialité, il s'installe directement dans vos sessions de travail.

---

## 📦 Commandes d'installation & Mise à jour

mAI CLI est disponible sur **macOS**, **Linux**, **WSL** et **Windows**.

### macOS (Homebrew)
```bash
brew install mDevsLabs/mAI-CLI/mai
```

### Linux / WSL
**Version stable (branche `main`)**
```bash
curl -fsSL https://raw.githubusercontent.com/mDevsLabs/mAI-CLI/main/scripts/install-remote.sh | bash
```

**Version canary (branche `canary`)**
```bash
curl -fsSL https://raw.githubusercontent.com/mDevsLabs/mAI-CLI/canary/scripts/install-canary.sh | bash
```

### Windows 10 / 11 (PowerShell)
**Version stable (branche `main`)**
```cmd
powershell -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/mDevsLabs/mAI-CLI/main/scripts/install-remote.ps1 | iex"
```

**Version canary (branche `canary`)**
```cmd
powershell -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/mDevsLabs/mAI-CLI/canary/scripts/install-canary.ps1 | iex"
```

### Depuis les sources
```bash
git clone https://github.com/mDevsLabs/mAI-CLI.git
cd mAI-CLI
bash scripts/install-user.sh       # macOS / Linux / WSL
powershell -ExecutionPolicy Bypass -File scripts\install-user.ps1   # Windows
```

### Mise à jour
```bash
mai --update
```

---

## 🔑 Providers Personnalisés (BYOK)

mAI CLI fonctionne sur le principe **Bring Your Own Key** (BYOK) sans aucune étape d'inscription obligatoire ni de login distant :

- **Configuration simple** : Indiquez directement vos clés d'API et choisissez votre fournisseur préféré (Ollama, Hugging Face, OpenAI, Anthropic, etc.).
- **Indépendance & Liberté** : Basculez d'un modèle ou fournisseur à un autre en quelques secondes selon la complexité de vos tâches.
- **Facturation directe** : Vos clés restent sous votre contrôle total, sans coût intermédiaire ni abonnement imposé.
- **Fournisseur mAI dédié** : Une option simplifiée sans configuration préalable est également en cours d'intégration.

---

## 🤖 Fonctionnalités d'Agents

L'agent mAI CLI agit directement sur votre environnement de travail local pour exécuter vos requêtes de manière autonome et sécurisée :

- 🔍 **Relecture de Pull Requests** : Synthèse automatique des diffs, repérage des zones sensibles et préparation des revues de code.
- 🐛 **Gestion des tickets & correctifs** : Analyse des bugs signalés, mise en relation avec les modules du projet et proposition de solutions.
- 📄 **Consultation & Édition de code** : Inspection de la structure du projet et application directe de modifications ciblées dans les fichiers.
- ⚡ **Exécution & Diagnostic Shell** : Lancement des compilations et suites de tests avec interprétation intelligente des erreurs de logs.
- 💬 **Messagerie Intégrée** : Communication directe (WhatsApp, Discord, X, Reddit) depuis la session de terminal pour informer vos équipes sans perte de contexte.

---

## 🔗 Liens Utiles

- Dépôt GitHub : [github.com/mDevsLabs/mAI-CLI](https://github.com/mDevsLabs/mAI-CLI)
- Signalement de bugs & Suggestions : [Issues GitHub](https://github.com/mDevsLabs/mAI-CLI/issues)
