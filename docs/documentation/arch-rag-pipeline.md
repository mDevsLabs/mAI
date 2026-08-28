---
title: "RAG Pipeline"
description: "Fonctionnement interne de la recherche documentaire et réinjection du contexte."
category: "Architecture"
order: 2
---

# Pipeline RAG & Retrieval-Augmented Generation 

Le pipeline RAG (Retrieval-Augmented Generation) de **mDevsLabs** permet d'augmenter les connaissances des modèles mAI avec des données d'entreprise fraîches sans ré-entraînement lourd.

---

## Étapes du Pipeline

```
1. Ingestion > 2. Chunking > 3. Embedding > 4. Hybrid Search > 5. Reranking > 6. Generation
```

### 1. Chunking Intelligent (Semantic Chunking)

Découpage des documents en blocs cohérents respectant les structures de paragraphes, les fonctions de code et les en-têtes Markdown au lieu d'un simple découpage par nombre de caractères.

### 2. Double Vectorisation & Sparse Tokens

Génération des vecteurs denses avec `mAI-Embeddings` et des vecteurs clairs avec l'indexeur BM25.

### 3. Cross-Encoder Reranking

Les 50 premiers résultats trouvés par mSearch sont ré-évalués par un modèle Cross-Encoder afin d'isoler les 5 contextes les plus pertinents.

---

## Structure du Contexte Injecté dans le Prompt

```markdown
<context_documents>
<doc index="1" score="0.94" source="guide-security.md">
...contenu du document 1...
</doc>
<doc index="2" score="0.88" source="app-mai.md">
...contenu du document 2...
</doc>
</context_documents>
```
