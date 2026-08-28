---
title: "Benchmarks"
description: "Mesures de débit tokens/seconde, temps de premier token (TTFT) et empreinte mémoire VRAM."
category: "Architecture"
order: 5
---

# Benchmarks de Performance & Latence ⏱

Cette page compile les résultats de tests de performance effectués sur les différentes déclinaisons des modèles **mAI** dans divers environnements matériels.

---

## ⏱ Débit d'Inférence (Tokens par Seconde - tk/s)

- **mAI-1-Light (2B)** - Apple M2 Mac Studio, Q4_K_M, TTFT 45 ms, Débit 112 tk/s
- **mAI-1-Light (2B)** - NVIDIA RTX 4060 Ti, Q8_0, TTFT 28 ms, Débit 145 tk/s
- **mAI-1 (12B)** - Apple M3 Max (64GB), Q4_K_M, TTFT 120 ms, Débit 48 tk/s
- **mAI-1 (12B)** - NVIDIA RTX 4090, Q8_0, TTFT 35 ms, Débit 82 tk/s

---

## Métriques Clés Expliquées

- **TTFT (Time-To-First-Token)** : Temps écoulé entre la réception de la requête HTTP et l'émission du tout premier token généré.
- **Débit de Génération (tk/s)** : Nombre de tokens générés par seconde lors de la phase de décodage.
- **Empreinte VRAM Peak** : Consommation maximale de mémoire vidéo incluant le KV-Cache pour une fenêtre de 32K tokens.

---

## Graphiques Comparatifs des Benchmarks

Retrouvez ci-dessous les scores d'évaluation des modèles mAI-1 et mAI-1-Light face aux modèles de référence du marché sur plusieurs tâches standards de raisonnement, de code et de multilinguisme :

### mAI-1 (12B)

:::flex
![mAI-1 Benchmark 1](/mai-1/mai-1-benchmark-1.png)
![mAI-1 Benchmark 2](/mai-1/mai-1-benchmark-2.png)
:::

### mAI-1-Light (2B)

:::flex
![mAI-1-Light Benchmark 1](/mai-1-light/mai-1-light-benchmark-1.png)
![mAI-1-Light Benchmark 2](/mai-1-light/mai-1-light-benchmark-2.png)
:::
