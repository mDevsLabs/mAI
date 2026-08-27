---
title: "mAI-1"
description: "Spécifications, capacités de raisonnement et performances du modèle principal mAI-1."
category: "Modèles d'IA"
order: 1
---

# mAI-1 - Modèle Multimodal Flagship (12B) 

**mAI-1** est le modèle phare développé par **mDevsLabs**. Basé sur l'architecture Google Gemma 4 12B Unified, il offre une combinaison idéale entre puissance de raisonnement, compréhension contextuelle et efficacité d'inférence en local.

---

## Fiche Technique

- **Nombre de Paramètres** : 12 Milliards (12B)
- **Fenêtre de Contexte Native** : 128 000 tokens (extensible à 256K via YaRN FlashAttention)
- **Architectures Supportées** : Transformers avec Attention Groupée (GQA) & RoPE 3D
- **Quantifications Officiellement Disponibles** :
  - `Q4_K_M` (Taille: 7.2 Go RAM, Recommandé pour laptops)
  - `Q8_0` (Taille: 13.1 Go RAM, Précision maximale)
  - `FP16` (Taille: 24.5 Go RAM, Inférence GPU professionnelle)

---

## Domaines d'Excellence

1. **Raisonnement Complexe & Multi-Hop** : Élaboration de plans d'action structurés étape par étape.
2. **Génération & Audit de Code** : Python, TypeScript, Rust, C++, SQL, Go.
3. **Traitement Multimodal Vision-Texte** : Compréhension conjointe de texte et de visuels.
4. **Tool Calling & Format Structuré** : Respect rigoureux des schémas JSON Schema pour l'exécution d'outils.

---

## Exemple d'Utilisation en Python SDK

```python
from mdevslabs import Client

client = Client()

response = client.chat.completions.create(
    model="mai-1",
    messages=[
        {"role": "system", "content": "Tu es un expert en sécurité informatique."},
        {"role": "user", "content": "Analyse les risques potentiels d'un jeton JWT sans signature."}
    ],
    temperature=0.3
)

print(response.choices[0].message.content)
```

---

## Benchmarks de Performance

Voici les résultats de mAI-1 par rapport aux modèles de référence de sa catégorie sur plusieurs tâches d'évaluation courantes :

![mAI-1 Benchmarks 1](/mai-1/mai-1-benchmark-1.png)

![mAI-1 Benchmarks 2](/mai-1/mai-1-benchmark-2.png)
