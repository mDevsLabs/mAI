---
title: "mAI-2"
description: "Notre meilleur modèle : raisonnement, codage, création, multimodal texte + images et 1M tokens de contexte. Disponible via l'API mAI pour tous les plans."
category: "Modèles d'IA"
order: 1
---

# mAI-2 — Modèle principal de la nouvelle génération

**mAI-2** est le modèle principal de la génération mAI-2, conçu pour les tâches les plus exigeantes : raisonnement profond, codage, création et analyse multimodale (texte et images), avec un contexte pouvant atteindre **1 million de tokens**.

> **Important** : mAI-2 n'est **pas disponible en exécution locale** (Ollama / HuggingFace). Il est appelable **exclusivement via l'API mAI**, compatible OpenAI, et accessible pour **tous les plans** (Free, Plus, Pro, Max) dans la limite de vos quotas hebdomadaires.

---

## Fiche Technique

- **Identifiant API** : `mai/mai-2`
- **Accès** : API mAI uniquement (cloud)
- **Fenêtre de Contexte** : 1 048 576 tokens (1M)
- **Sortie maximale** : 65 536 tokens
- **Modalités** : texte + images en entrée, texte en sortie
- **Capacités** : raisonnement (thinking), codage, création, appels d'outils (function calling), sortie JSON, vision
- **Date de sortie** : 5 septembre 2026

---

## Utilisation via l'API mAI

Point d'accès compatible OpenAI : `https://mai.val.run/v1/chat/completions`

```bash
curl https://mai.val.run/v1/chat/completions \
  -H "Authorization: Bearer $MAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mai/mai-2",
    "messages": [
      { "role": "user", "content": "Bonjour !" }
    ]
  }'
```

Le modèle est également listé dans `GET /v1/models` (pour tous les plans) et dans `GET /v1/models/mai` avec le champ `cloud: true`.

### Disponibilité et quotas

- Disponible pour **tous les plans d'abonnement** : Free, Plus, Pro et Max.
- Les appels consomment votre quota hebdomadaire mAI selon votre forfait (voir [Quotas du compte mAI](?doc=faq)).
- Compatible avec les routes `/v1/chat/completions`, `/v1/messages` (Anthropic) et les proxys Gemini.

### Erreurs

Si le modèle est momentanément indisponible, l'API renvoie :

```
Code : {CODE} - mAI est indisponible.
```

où `{CODE}` est le code d'erreur du fournisseur sous-jacent.

---

## Benchmarks

mAI-2 a été évalué sur une série de benchmarks couvrant le développement logiciel, les agents, l'utilisation d'outils et le raisonnement. Les scores ne sont affichés que lorsqu'une évaluation suffisamment comparable est publiquement disponible — aucune estimation n'est effectuée.

| Benchmark | mAI-2 | Claude Opus 5 | Claude Sonnet 5 | GPT-6 Astra | Gemini 3.8 Flash | Gemini 3.1 Pro |
|:---|---:|---:|---:|---:|---:|---:|
| **Terminal-Bench 2.1** | **82,7 %** | 84,6 % | 80,4 % | — | 89,4 % | — |
| **DeepSWE** | **54,4 %** | 73,6 % | — | 73,2 % | 73,8 % | — |
| **Agents' Last Exam** | **25,2 %** | 55,5 % | — | 59,3 % | — | 32,1 % |
| **AutomationBench** | **25,1 %** | 26,9 % | — | **41,4 %** | — | — |
| **MCP Atlas** | **70,3 %** | **85,8 %** | — | — | — | 78,2 % |

---

## Pour qui ?

- **Développeurs** : compréhension de projets complexes et contexte de 1M tokens pour des tâches de développement ambitieuses.
- **Étudiants** : apprentissage, analyse de documents et explications accessibles.
- **Créateurs** : écriture, imagination, structuration d'idées.
- **Grand public** : questions quotidiennes, analyse d'images et de documents.
- **Entreprises et scientifiques** : raisonnement et analyse d'informations complexes.
