---
title: "Installation"
description: "Guide Ã©tape par Ã©tape pour dÃ©ployer les modÃ¨les mAI via Ollama en local."
category: "Guides"
order: 1
---

# Guide d'Installation et d'ExÃ©cution (Ollama & Hugging Face) ð¦ð¤

Ce guide dÃ©taille l'installation pas-Ã -pas de l'Ã©cosystÃ¨me **mAI** sur votre machine locale via l'outil d'infÃ©rence universel **Ollama** ou via le **CLI Hugging Face**.

---

## ð¥ Ãtape 1 : Installation des PrÃ©requis

### TÃ©lÃ©chargement et Installation d'Ollama

### Sur macOS & Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Sur Windows

1. TÃ©lÃ©chargez l'exÃ©cutable officiel `OllamaSetup.exe` depuis [ollama.com/download](https://ollama.com/download).
2. Lancez l'installation et suivez les instructions Ã  l'Ã©cran.
3. VÃ©rifiez l'installation dans l'invite de commande (CMD ou PowerShell) :

```powershell
ollama --version
```

### Installation du CLI Hugging Face

Si vous prÃ©fÃ©rez tÃ©lÃ©charger les modÃ¨les purs avec Hugging Face :

```bash
pip install -U "huggingface_hub[cli]"
```

---

## ð¦ Ãtape 2 : TÃ©lÃ©chargement des ModÃ¨les mAI

Il est possible de tÃ©lÃ©charger n'importe quel modÃ¨le du registre officiel mDevsLabs.

### Via Ollama

```bash
# Pour le modÃ¨le gÃ©nÃ©ral mAI-1 (12B)
ollama pull mdevslabs/mai-1:latest

# Pour la version lÃ©gÃ¨re mAI-1-Light (3B)
ollama pull mdevslabs/mai-1-light:latest
```

### Via Hugging Face CLI

```bash
# Pour le modÃ¨le gÃ©nÃ©ral mAI-1
hf download mDevsLabs/mAI-1

# Pour la version lÃ©gÃ¨re mAI-1-Light
hf download mDevsLabs/mAI-1-Light
```

---

## ð Ãtape 3 : CrÃ©ation d'un Modelfile PersonnalisÃ©

Si vous souhaitez modifier les paramÃ¨tres systÃ¨me de mAI, crÃ©ez un fichier `Modelfile` :

```dockerfile
FROM mdevslabs/mai-1:latest

# DÃ©finir la tempÃ©rature et la taille de fenÃªtre contextuelle
PARAMETER temperature 0.4
PARAMETER num_ctx 32768

# Prompt systÃ¨me de base
SYSTEM """
Tu es un assistant IA dÃ©veloppÃ© par mDevsLabs. Tu rÃ©ponds de faÃ§on concise, prÃ©cise et experte en franÃ§ais avec un ton professionnel.
"""
```

Construisez votre modÃ¨le personnalisÃ© :

```bash
ollama create mon-mai-custom -f ./Modelfile
ollama run mon-mai-custom
```
