![mAI-2](/mai-2/16-9-cover.png)

# mAI-2 🌌

**mAI-2** est notre meilleur modèle : le modèle principal de la nouvelle génération mAI, conçu pour les tâches les plus exigeantes — raisonnement profond, codage, création et analyse multimodale (texte et images), avec un contexte pouvant atteindre **1 million de tokens**.

> mAI-2 n'est pas disponible en exécution locale : il est appelable **exclusivement via l'API mAI**, compatible OpenAI, et accessible pour **tous les plans** (Free, Plus, Pro, Max) selon vos quotas d'utilisation.

---

## ✨ Fonctionnalités

- 🧠 **Raisonnement avancé** : problèmes multi-étapes, analyse d'informations complexes, réponses structurées.
- 💻 **Codage** : jusqu'à 1M tokens de contexte pour comprendre des projets entiers, analyser plusieurs fichiers et mener des tâches de développement longues.
- ⚡ **Vitesse** : pensé pour passer rapidement de l'intention au résultat.
- ✨ **Création** : écrire, imaginer, structurer et explorer des idées.
- 👁️ **Multimodal** : texte + images (captures d'écran, documents, photos).
- 📚 **Long contexte** : 1 048 576 tokens.
- 🧩 **Agent-ready** : appels d'outils (function calling) et sortie JSON.
- ☁️ **API mAI uniquement** : identifiant `mai/mai-2`.

---

## ☁️ Utilisation via l'API mAI

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

- Disponible pour **tous les plans**, dans la limite de vos quotas hebdomadaires.
- Si le modèle est momentanément indisponible, l'API renvoie : `Code : {CODE} - mAI est indisponible.`

---

## 📊 Benchmarks face aux modèles frontier

mAI-2 a été évalué sur une série de benchmarks couvrant le développement logiciel, les agents, l'utilisation d'outils et le raisonnement. Les scores ne sont affichés que lorsqu'une évaluation suffisamment comparable est publiquement disponible — aucune estimation n'est effectuée.

| Benchmark | mAI-2 | Claude Opus 5 | Claude Sonnet 5 | GPT-6 Astra | Gemini 3.8 Flash | Gemini 3.1 Pro |
|:---|---:|---:|---:|---:|---:|---:|
| **Terminal-Bench 2.1** | **82,7 %** | 84,6 % | 80,4 % | — | 89,4 % | — |
| **DeepSWE** | **54,4 %** | 73,6 % | — | 73,2 % | 73,8 % | — |
| **Agents' Last Exam** | **25,2 %** | 55,5 % | — | 59,3 % | — | 32,1 % |
| **AutomationBench** | **25,1 %** | 26,9 % | — | **41,4 %** | — | — |
| **MCP Atlas** | **70,3 %** | **85,8 %** | — | — | — | 78,2 % |

---

*mAI-2 succède à mAI-1.5 et marque la plus grande avancée de mAI à ce jour : une intelligence de haut niveau, plus rapide, plus polyvalente, qui profite à tous.*
