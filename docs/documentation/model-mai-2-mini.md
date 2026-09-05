---
title: "mAI-2-Mini"
description: "La nouvelle génération mAI en version efficace et accessible : multimodal texte + images et 1M tokens de contexte. Disponible via l'API mAI pour tous les plans."
category: "Modèles d'IA"
order: 2
---

# mAI-2-Mini — La génération mAI-2, accessible à tous

**mAI-2-Mini** est la version efficace et accessible de la génération mAI-2 : un modèle plus léger, pensé pour offrir une expérience rapide au quotidien tout en conservant les fondations essentielles de la nouvelle génération — multimodalité texte et images et contexte pouvant atteindre **1 million de tokens**.

> **Important** : mAI-2-Mini n'est **pas disponible en exécution locale** (Ollama / HuggingFace). Il est appelable **exclusivement via l'API mAI**, compatible OpenAI, et accessible pour **tous les plans** (Free, Plus, Pro, Max) dans la limite de vos quotas hebdomadaires.

---

## Fiche Technique

- **Identifiant API** : `mai/mai-2-mini`
- **Accès** : API mAI uniquement (cloud)
- **Fenêtre de Contexte** : 1 048 576 tokens (1M)
- **Sortie maximale** : 32 768 tokens
- **Modalités** : texte + images en entrée, texte en sortie
- **Capacités** : raisonnement, codage, appels d'outils (function calling), sortie JSON, vision
- **Date de sortie** : 5 septembre 2026

---

## Utilisation via l'API mAI

Point d'accès compatible OpenAI : `https://mai.val.run/v1/chat/completions`

```bash
curl https://mai.val.run/v1/chat/completions \
  -H "Authorization: Bearer $MAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mai/mai-2-mini",
    "messages": [
      { "role": "user", "content": "Bonjour !" }
    ]
  }'
```

Le modèle est également listé dans `GET /v1/models` (pour tous les plans) et dans `GET /v1/models/mai` avec le champ `cloud: true`.

### Disponibilité et quotas

- Disponible pour **tous les plans d'abonnement** : Free, Plus, Pro et Max.
- Les appels consomment votre quota hebdomadaire mAI selon votre forfait.
- Compatible avec les routes `/v1/chat/completions`, `/v1/messages` (Anthropic) et les proxys Gemini.

### Erreurs

Si le modèle est momentanément indisponible, l'API renvoie :

```
Code : {CODE} - mAI est indisponible.
```

où `{CODE}` est le code d'erreur du fournisseur sous-jacent.

---

## Benchmarks

mAI-2-Mini a été évalué sur une sélection plus compacte de benchmarks orientés développement, efficacité et utilisation d'outils. Lorsque des différences de version ou de protocole peuvent modifier sensiblement les résultats, la valeur est laissée vide plutôt que d'établir une comparaison artificielle.

| Benchmark | mAI-2 Mini | Claude Opus 5 | Claude Sonnet 5 | Claude Haiku 4.5 | Gemini 3.5 Flash-Lite | Gemini 3.1 Pro |
|:---|---:|---:|---:|---:|---:|---:|
| **SWE-Bench Pro** | **59,0 %** | 79,2 % | **63,2 %** | 39,5 % | 54,2 % | 54,2 % |
| **Terminal-Bench 2.1** | **66,0 %** | 84,6 % | 80,4 % | 44,2 % | 54,0 % | — |
| **SWE-fficiency** | **34,8 %** | — | — | — | — | — |
| **KernelBench Hard** | **28,8 %** | 21,8 % | — | — | — | — |
| **MCP Atlas** | **74,2 %** | **85,8 %** | — | — | — | 78,2 % |

---

## Pour qui ?

- **Développeurs** : un assistant de développement rapide et économique pour les tâches quotidiennes.
- **Étudiants** : apprentissage, résumés et explications au quotidien.
- **Créateurs** : écriture et exploration d'idées avec une grande fenêtre de contexte.
- **Grand public** : questions, analyse d'images et aide quotidienne.
