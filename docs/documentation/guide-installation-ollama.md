---
title: "Installation"
description: "Guide étape par étape pour déployer les modèles mAI via Ollama en local."
category: "Guides"
order: 1
---

# Guide d'Installation et d'Exécution (Ollama & Hugging Face) 🦙🤗

Ce guide détaille l'installation pas-à-pas de l'écosystème **mAI** sur votre machine locale via l'outil d'inférence universel **Ollama** ou via le **CLI Hugging Face**.

---

## 📥 Étape 1 : Installation des Prérequis

### Téléchargement et Installation d'Ollama

### Sur macOS & Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Sur Windows

1. Téléchargez l'exécutable officiel `OllamaSetup.exe` depuis [ollama.com/download](https://ollama.com/download).
2. Lancez l'installation et suivez les instructions à l'écran.
3. Vérifiez l'installation dans l'invite de commande (CMD ou PowerShell) :

```powershell
ollama --version
```

### Installation du CLI Hugging Face

Si vous préférez télécharger les modèles purs avec Hugging Face :

```bash
pip install -U "huggingface_hub[cli]"
```

---

## 📦 Étape 2 : Téléchargement des Modèles mAI

Il est possible de télécharger n'importe quel modèle du registre officiel mDevsLabs.

### Via Ollama

```bash
# Pour le modèle général mAI-1 (12B)
ollama pull mdevslabs/mai-1:latest

# Pour la version légère mAI-1-Light (3B)
ollama pull mdevslabs/mai-1-light:latest
```

### Via Hugging Face CLI

```bash
# Pour le modèle général mAI-1
hf download mDevsLabs/mAI-1

# Pour la version légère mAI-1-Light
hf download mDevsLabs/mAI-1-Light
```

---

## 🚀 Étape 3 : Création d'un Modelfile Personnalisé

Si vous souhaitez modifier les paramètres système de mAI, créez un fichier `Modelfile` :

```dockerfile
FROM mdevslabs/mai-1:latest

# Définir la température et la taille de fenêtre contextuelle
PARAMETER temperature 0.4
PARAMETER num_ctx 32768

# Prompt système de base
SYSTEM """
Tu es un assistant IA développé par mDevsLabs. Tu réponds de façon concise, précise et experte en français avec un ton professionnel.
"""
```

Construisez votre modèle personnalisé :

```bash
ollama create mon-mai-custom -f ./Modelfile
ollama run mon-mai-custom
```
