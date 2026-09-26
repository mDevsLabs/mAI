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

| Benchmark | mAI-2 Mini | Claude Sonnet 5 | Claude Haiku 4.5 | Gemini 3.5 Flash-Lite | Gemini 3.8 Flash | GPT-6 Luna |
|:---|---:|---:|---:|---:|---:|---:|
| **SWE-Bench Pro** | **59,0 %** | 63,2 % | 39,5 % | 54,2 % | — | — |
| **Terminal-Bench 2.1** | **66,0 %** | 80,4 % | 44,2 % | 54,0 % | 89,4 % | — |
| **SWE-fficiency** | **34,8 %** | — | — | — | — | — |
| **KernelBench Hard** | **28,8 %** | — | — | — | — | — |
| **MCP Atlas** | **74,2 %** | — | — | — | — | — |

### Notes de méthode

- Les scores de mAI-2 Mini proviennent de notre campagne d'évaluation ; les autres scores ne sont retenus que lorsqu'une version de benchmark et un protocole suffisamment comparables sont disponibles.
- Un tiret cadratin (`—`) indique qu'aucun résultat public suffisamment comparable n'a été retenu. Il ne représente pas un score nul.
- Gemini 3.8 Flash est reporté uniquement pour Terminal-Bench 2.1, où son score comparable est de 89,4 %. GPT-6 Luna reste sans score comparable sur les cinq lignes de ce tableau.
- Une version différente d'un benchmark n'est jamais utilisée comme substitut.

### Sources officielles

- [Anthropic — Claude Sonnet 5 et Haiku 4.5](https://www.anthropic.com/claude-opus-5-5)
- [Google DeepMind — Gemini 3.8 Flash](https://deepmind.google/models/model-cards/gemini-3-8-flash/)
- [Z.ai — GLM 5.3 Flash](https://docs.z.ai/guides/vlm/glm-5.3-flash)
- [OpenAI — GPT-6 Sol et Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna/)

## Disponibilité

- **Cloud** : mAI Web et API mAI (`mai-2-mini`), pour tous les forfaits.
- **Sortie** : 25 octobre 2026.

Voir aussi [mAI-2](../mai-2/README.md), le modèle phare de la génération.
