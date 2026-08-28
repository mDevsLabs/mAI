---
title: "mAI-1-Light"
description: "Modèle compact optimisé pour l'exécution rapide sur GPU modeste ou CPU."
category: "Modèles d'IA"
order: 2
---

# mAI-1-Light - Modèle Ultra-Léger (2B) 

**mAI-1-Light** est la version condensée et ultra-rapide du modèle mAI-1. Avec seulement 2 milliards de paramètres, il est conçu spécifiquement pour s'exécuter avec une latence quasi-nulle sur des machines grand public, des téléphones portables ou des puces embarquées (Edge Computing).

---

## Spécifications Techniques

- **Taille des Paramètres** : 2 Milliards (2B)
- **Vitesse d'Inférence** : > 80 tokens/sec sur M1/M2/M3 Mac & RTX 3050.
- **Empreinte VRAM** : 1.8 Go (quantification Q4_K_M)
- **Contexte Maximal** : 32 768 tokens.

---

## Cas d'Usage Recommandés

- **Triage Rapide de Messages** : Classification de courriels et détection d'intention.
- **Autocomplétion Inline** : Assistance d'écriture en temps réel dans des éditeurs de texte ou IDE.
- **Applications Mobile / Embarquées** : Inférence locale sans connexion Internet.
- **Synthèse de Textes Courts** : Résumés instantanés de paragraphes.

---

## Commande Ollama

```bash
ollama run mdevslabs/mai-1-light:latest
```

---

## Benchmarks de Performance

Voici les résultats de mAI-1-Light par rapport aux modèles ultra-légers de référence sur plusieurs tâches d'évaluation courantes :

![mAI-1-Light Benchmarks 1](/mai-1-light/mai-1-light-benchmark-1.png)

![mAI-1-Light Benchmarks 2](/mai-1-light/mai-1-light-benchmark-2.png)
