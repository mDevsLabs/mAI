---
title: "mAI Web"
description: "Présentation complète et architecture de l'assistant mAI Web."
category: "Applications"
order: 1
---

# mAI Web - Assistant IA Web & Multimodal 🧠✨

**mAI Web** est l'assistant IA web de l'écosystème **mDevsLabs**. Il s'agit d'un assistant IA hautement sécurisé, capable de traiter du texte, du code, des documents complexes et des données visuelles directement depuis votre navigateur.

---

## 🌟 Caractéristiques Principales

- **Conception Web Moderne** : Une interface d'IA réactive et fluide accessible sur le Web.
- **Moteur Multimodal** : Capacité native d'analyse d'images, de diagrammes et d'images techniques grâce aux encodeurs visuels mAI-Vision.
- **Intégration Ollama & Llama.cpp** : Moteur d'inférence basé sur `ollama` avec quantification automatique (GGUF Q4_K_M et Q8_0).
- **Agent Framework Intégré** : Support natif du *tool calling* pour exécuter des fonctions Python, interroger des bases de données ou exécuter du code isolé.

---

## 🏗️ Architecture Technique

```
┌───────────────────────────────────────────────────────────┐
│                    mAI Web Interface                      │
└─────────────────────────────┬─────────────────────────────┘
                              │ API REST / WebSockets
┌─────────────────────────────▼─────────────────────────────┐
│                   mDevsLabs Agent Core                    │
├─────────────────────────────┬─────────────────────────────┤
│   Inference Controller      │     Memory & RAG Pipeline   │
└──────────────┬──────────────┴──────────────┬──────────────┘
               │                             │
┌──────────────▼──────────────┐┌─────────────▼──────────────┐
│       Ollama Engine         ││     Vector Store (HNSW)    │
└─────────────────────────────┘└──────────────────────────────┘
```

---

## 🔧 Intégration Programmatique

### En Python (SDK)

```python
from mdevslabs import AsyncmDevsClient

async def main():
    async with AsyncmDevsClient() as client:
        stream = await client.chat.stream(
            model="mai-1",
            messages=[{"role": "user", "content": "Refactore ce code Python"}]
        )
        async for chunk in stream:
            print(chunk.delta, end="", flush=True)

asyncio.run(main())
```

### En TypeScript/JavaScript

```typescript
import { mDevsClient } from '@mdevslabs/sdk';

const client = new mDevsClient({ apiKey: process.env.MDEVS_API_KEY });

const result = await client.chat.completions.create({
    model: 'mai-1',
    messages: [{ role: 'user', content: 'Explique le fonctionnement des transformers' }],
    stream: true,
});

for await (const chunk of result) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

---

## 🚀 Exemple de Lancement Rapide

Vous pouvez démarrer mAI directement depuis le terminal via Ollama :

```bash
# Télécharger et lancer l'assistant mAI
ollama run mdevslabs/mai-1:latest

# Exemple de prompt
> Explique-moi le fonctionnement des transformateurs attentionnels en 3 points.
```

---

## ⚙️ Configuration Recommandée

- **RAM** : 16 Go DDR4 (minimale) / 32 Go DDR5 (recommandée)
- **GPU** : NVIDIA RTX 3060 (8 Go VRAM) (minimale) / NVIDIA RTX 4080/4090 (16+ Go VRAM) (recommandée)
- **Stockage** : 20 Go SSD NVMe (minimale) / 50 Go SSD NVMe PCIe 4.0 (recommandée)
- **OS** : Linux / macOS / Windows WSL2 (minimale) / Ubuntu 22.04 LTS / macOS Sonoma (recommandée)

---

## 🔒 Confidentialité & Alignement

mAI intègre un garde-fou éthique local sans censurer les usages scientifiques et techniques. Toutes les requêtes sont filtrées par un module d'audit local pour prévenir l'injection de prompts non désirée.

---

## 📚 Ressources Supplémentaires

- **Documentation complète** : [Guide Installation Ollama](/docs?doc=guide-installation-ollama)
- **Prompt Engineering** : [Meilleures pratiques](/docs?doc=guide-prompt-engineering)
- **Sécurité** : [Guide Confidentialité](/docs?doc=guide-security-privacy)
- **Fine-Tuning** : [Adapter le modèle](/docs?doc=guide-fine-tuning)
