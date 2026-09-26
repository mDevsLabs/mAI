# mAI-2

**Our flagship model, for the best price.**

mAI-2 est le modèle principal de la génération mAI-2. Il succède à mAI-1.5 avec une ambition claire : rendre l'intelligence la plus avancée du laboratoire **plus rapide, plus polyvalente et plus accessible**. Contrairement aux générations précédentes, mAI-2 s'exécute dans le cloud via l'API mAI — aucune installation locale n'est nécessaire.

## Caractéristiques

| Spécification | Valeur |
|:---|:---|
| Contexte | Jusqu'à 1 000 000 de tokens |
| Sortie maximale | 384 000 tokens |
| Modalités | Texte + images |
| Exécution | Cloud (API mAI) |
| Alias API | `mai-2` |
| Licence | MIT |
| Date de sortie | 25/10/2026 |

Les deux modèles de la génération prennent en charge **le texte et les images nativement** : une capture d'écran, un document ou du code peuvent devenir le point de départ d'une même interaction, sans conversion préalable en texte.

## Quatre domaines au cœur de mAI-2

- **Raisonnement** — traiter des problèmes nécessitant plusieurs étapes de réflexion et construire des réponses structurées.
- **Codage** — comprendre des projets complexes et conserver le contexte sur des tâches longues.
- **Vitesse** — réduire la friction entre l'intention et le résultat.
- **Création** — écrire, imaginer, structurer et transformer des idées.

## Utilisation via l'API mAI

```bash
curl https://mai.val.run/v1/chat/completions \
  -H "Authorization: Bearer $MAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mai-2",
    "messages": [{ "role": "user", "content": "Bonjour mAI" }]
  }'
```

Le modèle est également accessible depuis **mAI Web** et l'ensemble des applications de la suite (CLI, Coder, Pulse).

## Benchmarks

mAI-2 obtient les résultats suivants sur la campagne d'évaluation mAI-2 :

| Benchmark | mAI-2 | Claude Opus 5.5 | Claude Sonnet 5 | GPT-6 Astra | Gemini 3.8 Flash | GLM 5.3 Flash |
|:---|---:|---:|---:|---:|---:|---:|
| **Terminal-Bench 2.1** | **90,6 %** | — | 80,4 % | — | 89,4 % | 84,3 % |
| **DeepSWE v1.1** | **74,2 %** | — | 54,0 % | 74,1 % | 73,7 % | 63,4 % |
| **NL2Repo-Bench** | **64,0 %** | — | — | — | — | — |
| **CyberGym** | **88,1 %** | — | — | — | — | — |
| **AutomationBench** | **54,8 %** | 40,0 % | — | — | — | 48,8 % |
| **Agents' Last Exam** | **31,8 %** | — | — | 59,3 % | — | 26,3 % |
| **Humanity's Last Exam — avec outils** | **63,9 %** | 67,7 % | 57,4 % | 57,2 % | — | 55,3 % |
| **SEC-Bench Pro** | **62,8 %** | — | — | 85,4 % | — | — |
| **ProgramBench** | **20,3 %** | — | — | — | — | — |

### Notes de méthode

- Les scores de mAI-2 proviennent de notre campagne d'évaluation mAI-2 ; les autres scores ne sont retenus que lorsqu'une version de benchmark et un protocole suffisamment comparables sont disponibles.
- Un tiret cadratin (`—`) indique qu'aucun résultat public suffisamment comparable n'a été retenu. Il ne représente pas un score nul.
- Les variantes de Humanity's Last Exam qui ne partagent pas le protocole « avec outils » ne sont pas utilisées pour cette ligne.
- Une version différente d'un benchmark n'est jamais utilisée comme substitut, et les scores ne sont pas comparés au-delà des conditions décrites ci-dessus.

### Sources officielles

- [Anthropic — Claude Opus 5.5](https://www.anthropic.com/claude-opus-5-5)
- [Google DeepMind — Gemini 3.8 Flash](https://deepmind.google/models/model-cards/gemini-3-8-flash/)
- [Z.ai — GLM 5.3 Flash](https://docs.z.ai/guides/vlm/glm-5.3-flash)
- [OpenAI — GPT-6 Sol et Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna/)

## Disponibilité

- **Cloud** : mAI Web et API mAI (`mai-2`), pour tous les forfaits.
- **Sortie** : 25 octobre 2026.

Voir aussi [mAI-2-Mini](../mai-2-mini/README.md) pour la variante équilibrée de la même génération.
