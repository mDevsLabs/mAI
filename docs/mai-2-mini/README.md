# mAI-2-Mini

**Our balanced model, for increased price.**

mAI-2-Mini est le modèle équilibré de la génération mAI-2 : une expérience plus légère et accessible, qui conserve les fondations essentielles de cette nouvelle génération — raisonnement, codage et multimodalité texte + images. Comme mAI-2, il s'utilise dans le cloud via l'API mAI.

## Caractéristiques

| Spécification | Valeur |
|:---|:---|
| Contexte | Jusqu'à 1 000 000 de tokens |
| Sortie maximale | 128 000 tokens |
| Modalités | Texte + images |
| Exécution | Cloud (API mAI) |
| Alias API | `mai-2-mini` |
| Licence | MIT |
| Date de sortie | 25/10/2026 |

## Utilisation via l'API mAI

```bash
curl https://mai.val.run/v1/chat/completions \
  -H "Authorization: Bearer $MAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mai-2-mini",
    "messages": [{ "role": "user", "content": "Résume ce document" }]
  }'
```

Le modèle est également accessible depuis **mAI Web** et le reste de la suite mAI.

## Benchmarks

mAI-2-Mini a été évalué sur une sélection plus compacte de benchmarks orientés développement, efficacité et utilisation d'outils :

| Benchmark | mAI-2 Mini | Claude Opus 5 | Claude Sonnet 5 | Claude Haiku 4.5 | Gemini 3.5 Flash-Lite | Gemini 3.1 Pro |
|:---|---:|---:|---:|---:|---:|---:|
| **SWE-Bench Pro** | **59,0 %** | 79,2 % | 63,2 % | 39,5 % | 54,2 % | 54,2 % |
| **Terminal-Bench 2.1** | **66,0 %** | 89,1 % | 80,4 % | 44,2 % | 54,0 % | — |
| **SWE-fficiency** | **34,8 %** | — | — | — | — | — |
| **KernelBench Hard** | **28,8 %** | 21,8 % | — | — | — | — |
| **MCP Atlas** | **74,2 %** | 85,8 % | — | — | — | 78,2 % |

mAI-2-Mini conserve ainsi une orientation claire : proposer un modèle plus léger tout en restant compétitif sur plusieurs tâches de développement et d'utilisation d'outils.

## Disponibilité

- **Cloud** : mAI Web et API mAI (`mai-2-mini`), pour tous les forfaits.
- **Sortie** : 25 octobre 2026.

Voir aussi [mAI-2](../mai-2/README.md), le modèle phare de la génération.
