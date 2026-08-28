---
title: "CLI (Bêta)"
description: "Discussions et séances de codage dans le terminal CLI via mAI."
category: "Applications"
order: 3
---

# CLI - Discussions & Codage dans le Terminal 

**CLI** est l'assistant en ligne de commande de l'écosystème **mAI**. Conçu pour les développeurs, DevOps et administrateurs système, il apporte un copilote d'intelligence artificielle au cœur de votre shell.

- **Statut** : **Bêta**
- **Dépôt GitHub** : [https://github.com/mDevsLabs/CLI](https://github.com/mDevsLabs/CLI)

---

## Installation Rapide

```bash
# Via npm
npm install -g @mdevslabs/mai-cli

# Ou via Homebrew (macOS)
brew install mDevsLabs/CLI/mai
```

---

## Fonctionnalités Clés

- **Chat Terminal Interactif** : Discutez avec mAI directement depuis votre session bash, zsh ou PowerShell.
- **Génération & Diagnostic de Commandes** : Expliquez ce que vous souhaitez accomplir, mAI génère la commande appropriée.
- **Analyse de Logs & Dépannage** : Pipez la sortie de vos commandes vers mAI pour obtenir une explication claire des erreurs (`cat error.log | mai explain`).
- **Support Multi-Providers (BYOK)** : Utilisez vos clés mAI, OpenAI, Anthropic ou des modèles locaux Ollama.
