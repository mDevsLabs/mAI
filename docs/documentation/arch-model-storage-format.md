---
title: "Format Modèles"
description: "Structure des fichiers de poids, schémas de quantification (Q4_K_M, Q8_0) et chargement."
category: "Architecture"
order: 4
---

# Formats de Stockage : GGUF, Safetensors & Quantification 

Les modèles d'IA développés par **mDevsLabs** sont distribués dans des formats de stockage binaires hautement optimisés pour la distribution et l'inférence locale.

---

## Safetensors vs GGUF

### Safetensors

Format binaire sécurisé développé par HuggingFace pour remplacer `pickle`. Utilisé principalement pour l'entraînement, le fine-tuning et l'inférence haute précision (FP16/BF16) sur GPU.

### GGUF (GPT-Generated Unified Format)

Format universel extensible développé pour `llama.cpp` et `ollama`. Il contient dans un fichier unique :
1. Les métadonnées complètes du modèle (architecture, tokenizer, paramètres).
2. Les poids quantifiés block par block.

---

## Matrice des Quantifications mDevsLabs

- **Q4_K_M** : Précision Perplexité de 98.2% du FP16, Taille Fichier de 7.2 Go, Usage général local (Laptops/Desktops)
- **Q5_K_M** : Précision Perplexité de 99.1% du FP16, Taille Fichier de 8.6 Go, Bon équilibre qualité/vitesse
- **Q8_0** : Précision Perplexité de 99.9% du FP16, Taille Fichier de 13.1 Go, Inférence sans perte mesurable
- **FP16** : Précision Perplexité de 100.0% (Référence), Taille Fichier de 24.5 Go, Serveurs GPU de production

