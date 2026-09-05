![mAI-2-Mini](/mai-2/16-9-cover.png)

# mAI-2-Mini 🪐

**mAI-2-Mini** est la version efficace et accessible de la nouvelle génération mAI : un modèle plus léger, pensé pour offrir une expérience rapide au quotidien tout en conservant les fondations essentielles de mAI-2 — multimodalité texte et images et contexte pouvant atteindre **1 million de tokens**.

> mAI-2-Mini n'est pas disponible en exécution locale : il est appelable **exclusivement via l'API mAI**, compatible OpenAI, et accessible pour **tous les plans** (Free, Plus, Pro, Max) selon vos quotas d'utilisation.

---

## ✨ Fonctionnalités

- ⚡ **Efficace et accessible** : pensé pour un usage fluide au quotidien.
- 🧠 **Raisonnement** : les fondations essentielles de la génération mAI-2.
- 💻 **Codage & outils** : développement, agents et utilisation d'outils.
- 👁️ **Multimodal** : texte + images.
- 📚 **Long contexte** : 1 048 576 tokens.
- 🧩 **Agent-ready** : appels d'outils (function calling) et sortie JSON.
- ☁️ **API mAI uniquement** : identifiant `mai/mai-2-mini`.

---

## ☁️ Utilisation via l'API mAI

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

- Disponible pour **tous les plans**, dans la limite de vos quotas hebdomadaires.
- Si le modèle est momentanément indisponible, l'API renvoie : `Code : {CODE} - mAI est indisponible.`

---

## 📊 Benchmarks face aux modèles frontier

mAI-2-Mini a été évalué sur une sélection plus compacte de benchmarks orientés développement, efficacité et utilisation d'outils. Lorsque des différences de version ou de protocole peuvent modifier sensiblement les résultats, la valeur est laissée vide plutôt que d'établir une comparaison artificielle.

| Benchmark | mAI-2 Mini | Claude Opus 5 | Claude Sonnet 5 | Claude Haiku 4.5 | Gemini 3.5 Flash-Lite | Gemini 3.1 Pro |
|:---|---:|---:|---:|---:|---:|---:|
| **SWE-Bench Pro** | **59,0 %** | 79,2 % | **63,2 %** | 39,5 % | 54,2 % | 54,2 % |
| **Terminal-Bench 2.1** | **66,0 %** | 84,6 % | 80,4 % | 44,2 % | 54,0 % | — |
| **SWE-fficiency** | **34,8 %** | — | — | — | — | — |
| **KernelBench Hard** | **28,8 %** | 21,8 % | — | — | — | — |
| **MCP Atlas** | **74,2 %** | **85,8 %** | — | — | — | 78,2 % |

---

*mAI-2-Mini : la nouvelle génération mAI, accessible à tous.*
