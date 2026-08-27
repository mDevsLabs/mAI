---
title: "Fine-Tuning"
description: "Méthodologie pour adapter les modèles mAI à vos jeux de données métiers."
category: "Guides"
order: 4
---

# Fine-Tuning de Modèles avec LoRA et QLoRA 

Ce guide explique comment réentraîner et adapter le modèle **mAI-1** sur vos propres jeux de données spécialisés en utilisant les méthodes d'adaptation à bas rang **LoRA (Low-Rank Adaptation)** et **QLoRA (Quantized LoRA)**.

---

## Outils & Bibliothèques Requis

- Python 3.10+
- `unsloth`, `peft`, `transformers`, `bitsandbytes`, `trl`
- GPU NVIDIA avec au moins 16 Go de VRAM (ex: RTX 4090 ou A10G)

### Installation

```bash
pip install unsloth peft transformers bitsandbytes trl
```

---

## Script d'Entraînement avec Unsloth & PEFT

```python
from unsloth import FastLanguageModel
import torch
from trl import SFTTrainer
from transformers import TrainingArguments

max_seq_length = 4096

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="mdevslabs/mai-1",
    max_seq_length=max_seq_length,
    load_in_4bit=True,
)

model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
)

# Configuration de l'entraîneur
trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=max_seq_length,
    args=TrainingArguments(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=10,
        max_steps=100,
        learning_rate=2e-4,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        output_dir="outputs",
    ),
)

trainer.train()
model.save_pretrained_gguf("mai-1-custom-lora", tokenizer, quantization_method="q4_k_m")
```

---

## Préparation des Données

### Format JSON Lines

```json
{"text": "<s>[INST] <<SYS>>\nTu es un assistant Python expert.\n<</SYS>>\nÉcris une fonction qui calcule la factorielle en Python. [/INST]"}
{"text": "<s>[INST] <<SYS>>\nTu es un assistant Python expert.\n<</SYS>>\nComment optimiser une requête SQL lente ? [/INST]"}
```

### Format Dataset HuggingFace

```python
from datasets import load_dataset

dataset = load_dataset("json", data_files="training_data.jsonl")["train"]
```

---

## Hyperparamètres Recommandés

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| `r` | 16-64 | Rang de la matrice LoRA |
| `lora_alpha` | 16-32 | Facteur d'échelle |
| `lora_dropout` | 0.0-0.1 | Dropout pour régularisation |
| `learning_rate` | 2e-4 à 1e-5 | Taux d'apprentissage |
| `batch_size` | 1-4 | Taille du batch |
| `gradient_accumulation` | 4-8 | Accumulation de gradients |

---

## Déploiement du Modèle Fine-Tuned

### Sauvegarde Local

```python
# Sauvegarder le modèle fine-tuné
model.save_pretrained("mai-1-finetuned")
tokenizer.save_pretrained("mai-1-finetuned")

# Convertir en GGUF pour Ollama
model.save_pretrained_gguf("mai-1-finetuned.gguf", tokenizer)
```

### Déploiement avec Ollama

```bash
# Créer un Modelfile
cat > Modelfile << EOF
FROM ./mai-1-finetuned.gguf
PARAMETER temperature 0.7
PARAMETER num_ctx 32768
SYSTEM "Tu es un assistant expert en [votre domaine]."
EOF

# Créer le modèle
ollama create mai-custom -f Modelfile

# Lancer
ollama run mai-custom
```

---

## Évaluation du Fine-Tuning

### Métriques

```python
from peft import PeftModel

# Charger le modèle fine-tuné
model = PeftModel.from_pretrained(base_model, "mai-1-finetuned")

# Évaluer sur un dataset de test
eval_results = trainer.evaluate()
print(f"Perplexity: {eval_results['eval_loss']}")
```

### Tests de Prompt

```python
prompts = [
    "Explique la différence entre GET et POST.",
    "Écris un test unitaire pour une fonction de calcul.",
    "Analyse ce code Python pour des bugs."
]

for prompt in prompts:
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_new_tokens=200)
    print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

---

## Conseils Avancés

### 1. Early Stopping

```python
trainer = SFTTrainer(
    ...
    args=TrainingArguments(
        ...
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        early_stopping_patience=3,
    ),
)
```

### 2. LoRA Adapter pour Plusieurs Tâches

```python
# Adapter spécialisé pour le code
code_adapter = model.create_lora_adapter(
    r=32,
    target_modules=["q_proj", "v_proj"]
)

# Adapter pour la rédaction
writing_adapter = model.create_lora_adapter(r=16)
```

### 3. Mélange de Tâches

```python
# Dataset mixte
dataset = load_dataset("my_dataset")
dataset = dataset.shuffle(seed=42)

# Entraînement multi-tâche
for task_name, task_data in dataset.items():
    trainer.train(task_data, adapter=task_name)
```

---

## Ressources

- **Guide d'installation** : [Ollama Guide](/docs?doc=guide-installation-ollama)
- **Prompt Engineering** : [Meilleures pratiques](/docs?doc=guide-prompt-engineering)
- **Sécurité** : [Guide Privacy](/docs?doc=guide-security-privacy)