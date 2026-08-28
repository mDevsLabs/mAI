---
title: "Mémoire"
description: "Gestion des fenêtres glissantes, mémoire à long terme et compression du contexte."
category: "Guides"
order: 6
---

# Gestion de la Mémoire Contextuelle & Fenêtres Glissantes 

Lors d'échanges prolongés ou du traitement de volumineux documents, la fenêtre de contexte d'un LLM peut se remplir. Ce guide présente les stratégies implémentées par **mDevsLabs** pour maintenir une mémoire contextuelle efficace et réactive.

---

## Stratégies de Gestion du Contexte

### 1. Fenêtre Glissante (Sliding Window Attention)

Seuls les $N$ derniers messages sont conservés intacts dans la mémoire vive du modèle, tandis que les messages plus anciens sont archivés sous forme de résumés synthétiques.

```
[System Message] > [Résumé des tours 1 à 15] > [Message 16] > [Message 17 (Récent)]
```

### 2. Compression Automatique du Contexte (LLMLingua Integration)

mDevsLabs intègre un module de réduction de tokens en supprimant les mots redondants et tokens à faible entropie sans détériorer le sens sémantique de l'instruction.

### 3. Mémoire Long-Terme Vectorielle (Semantic Memory Store)

Les informations clés dites "permanentes" (préférences de l'utilisateur, contraintes de projet, décisions d'architecture) sont stockées séparément dans la base vectorielle mSearch et réinjectées à la demande.
