---
title: "Télécharger"
description: "Guide d'installation globale pour la suite mAI et nos modèles IA."
category: "Guides"
order: 13
---

# Guide de Téléchargement 

Ce document récapitule les étapes nécessaires pour télécharger, installer et déployer nos outils de travail.

## Applications & Outils

1. Accédez à la page [Télécharger](/downloads) de mAI.
2. Choisissez le canal souhaité :
   - **Canal Stable** : Version testée et recommandée pour la production.
   - **Canal Canary** : Version expérimentale contenant les dernières fonctionnalités.

## Application Mobile Android

1. Accédez à la page [Télécharger](/downloads) de mAI.
2. Téléchargez l'application mobile Android (archive ZIP contenant l'APK).
3. Consultez le [Guide d'installation Android](/docs?doc=guide-application-android) pour savoir comment extraire et installer l'application sur votre appareil.

## Modèles Ollama & Hugging Face

Pour faire tourner nos modèles IA locaux, assurez-vous d'avoir Ollama ou le CLI Hugging Face installé sur votre ordinateur :

**Avec Ollama :**
```bash
# Lancer mAI-1
ollama run mDevsLabs/mAI-1

# Lancer mAI-1-Light
ollama run mDevsLabs/mAI-1-Light
```

**Avec Hugging Face CLI :**
```bash
# Télécharger mAI-1
hf download mDevsLabs/mAI-1

# Télécharger mAI-1-Light
hf download mDevsLabs/mAI-1-Light
```
