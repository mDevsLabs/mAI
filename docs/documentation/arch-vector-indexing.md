---
title: "Indexation"
description: "Algorithmes de recherche de plus proches voisins et gestion des index vectoriels."
category: "Architecture"
order: 3
---

# Indexation Vectorielle & Graphes HNSW 

L'indexation vectorielle dans **mSearch** repose sur des structures de données de graphes hiérarchiques de petits mondes navigateurs : **HNSW (Hierarchical Navigable Small World)**.

---

## Paramètres de Performance HNSW

- `M` (Nombre maximal de connexions par nœud) : Défini par défaut à `16` pour un bon compromis mémoire/vitesse.
- `ef_construction` (Profondeur de recherche lors de l'indexation) : `200` pour garantir un graphe très interconnecté.
- `ef_search` (Profondeur de recherche lors de la requête) : `64` par défaut (ajustable dynamiquement selon la latence visée).

---

## Formule de Distance Cosinus

La similarité sémantique entre deux vecteurs $\mathbf{u}$ et $\mathbf{v}$ est calculée par :

$$\text{Similarity}(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2}$$

Puisque tous les vecteurs générés par `mAI-Embeddings` sont pré-normalisés ($\|\mathbf{u}\|_2 = 1$), la distance se réduit à un simple produit scalaire direct, optimisé par les instructions vectorielles CPU SIMD (AVX-512 / ARM Neon) et les Tensor Cores GPU.
