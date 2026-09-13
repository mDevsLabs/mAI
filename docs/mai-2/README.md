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

| Benchmark | mAI-2 | Claude Opus 5 | Claude Sonnet 5 | GPT-6 Astra | Gemini 3.8 Flash | Gemini 3.1 Pro |
|:---|---:|---:|---:|---:|---:|---:|
| **Terminal-Bench 2.1** | **90,6 %** | 89,1 % | 80,4 % | — | 89,4 % | — |
| **DeepSWE v1.1** | **74,2 %** | 74,0 % | 54,0 % | 74,1 % | 73,7 % | — |
| **NL2Repo-Bench** | **64,0 %** | 75,3 % | — | — | — | — |
| **CyberGym** | **88,1 %** | — | — | — | — | — |
| **AutomationBench** | **54,8 %** | 50,3 % | — | — | — | — |
| **Agents' Last Exam** | **31,8 %** | 28,6 % | — | 59,3 % | — | — |
| **Humanity's Last Exam — avec outils** | **63,9 %** | 63,6 % | 57,4 % | 57,2 % | — | — |
| **SEC-Bench Pro** | **62,8 %** | — | — | 85,4 % | — | — |
| **ProgramBench** | **20,3 %** | 37,0 % | — | — | — | — |

Ces résultats utilisent notre campagne d'évaluation mAI-2 et les résultats publics les plus récents disponibles pour les autres modèles. Les scores peuvent varier selon le harness, les paramètres de raisonnement et les conditions exactes d'évaluation ; nous privilégions donc les comparaisons utilisant la même version du benchmark.

## Disponibilité

- **Cloud** : mAI Web et API mAI (`mai-2`), pour tous les forfaits.
- **Sortie** : 25 octobre 2026.

Voir aussi [mAI-2-Mini](../mai-2-mini/README.md) pour la variante équilibrée de la même génération.
