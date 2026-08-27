---
title: "mAI Web"
description: "PrÃ©sentation complÃ¨te et architecture de l'assistant mAI Web."
category: "Applications"
order: 1
---

# mAI Web - Assistant IA Web & Multimodal ð§ â¨

**mAI Web** est l'assistant IA web de l'Ã©cosystÃ¨me **mDevsLabs**. Il s'agit d'un assistant IA hautement sÃ©curisÃ©, capable de traiter du texte, du code, des documents complexes et des donnÃ©es visuelles directement depuis votre navigateur.

---

## ð CaractÃ©ristiques Principales

- **Conception Web Moderne** : Une interface d'IA rÃ©active et fluide accessible sur le Web.
- **Moteur Multimodal** : CapacitÃ© native d'analyse d'images, de diagrammes et d'images techniques grÃ¢ce aux encodeurs visuels mAI-Vision.
- **IntÃ©gration Ollama & Llama.cpp** : Moteur d'infÃ©rence basÃ© sur `ollama` avec quantification automatique (GGUF Q4_K_M et Q8_0).
- **Agent Framework IntÃ©grÃ©** : Support natif du *tool calling* pour exÃ©cuter des fonctions Python, interroger des bases de donnÃ©es ou exÃ©cuter du code isolÃ©.

---

## ðï¸ Architecture Technique

```
âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
â                    mAI Web Interface                      â
âââââââââââââââââââââââââââââââ¬ââââââââââââââââââââââââââââââ
                              â API REST / WebSockets
âââââââââââââââââââââââââââââââ¼ââââââââââââââââââââââââââââââ
â                   mDevsLabs Agent Core                    â
âââââââââââââââââââââââââââââââ¬ââââââââââââââââââââââââââââââ¤
â   Inference Controller      â     Memory & RAG Pipeline   â
ââââââââââââââââ¬âââââââââââââââ´âââââââââââââââ¬âââââââââââââââ
               â                             â
ââââââââââââââââ¼ââââââââââââââââââââââââââââââ¼âââââââââââââââ
â       Ollama Engine         ââ     Vector Store (HNSW)    â
âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
```

---

## ð§ IntÃ©gration Programmatique

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

## ð Exemple de Lancement Rapide

Il est possible de dÃ©marrer mAI directement depuis le terminal via Ollama :

```bash
# TÃ©lÃ©charger et lancer l'assistant mAI
ollama run mdevslabs/mai-1:latest

# Exemple de prompt
> Explique-moi le fonctionnement des transformateurs attentionnels en 3 points.
```

---

## âï¸ Configuration RecommandÃ©e

- **RAM** : 16 Go DDR4 (minimale) / 32 Go DDR5 (recommandÃ©e)
- **GPU** : NVIDIA RTX 3060 (8 Go VRAM) (minimale) / NVIDIA RTX 4080/4090 (16+ Go VRAM) (recommandÃ©e)
- **Stockage** : 20 Go SSD NVMe (minimale) / 50 Go SSD NVMe PCIe 4.0 (recommandÃ©e)
- **OS** : Linux / macOS / Windows WSL2 (minimale) / Ubuntu 22.04 LTS / macOS Sonoma (recommandÃ©e)

---

## ð ConfidentialitÃ© & Alignement

mAI intÃ¨gre un garde-fou Ã©thique local sans censurer les usages scientifiques et techniques. Toutes les requÃªtes sont filtrÃ©es par un module d'audit local pour prÃ©venir l'injection de prompts non dÃ©sirÃ©e.

---

## ð Ressources SupplÃ©mentaires

- **Documentation complÃ¨te** : [Guide Installation Ollama](/docs?doc=guide-installation-ollama)
- **Prompt Engineering** : [Meilleures pratiques](/docs?doc=guide-prompt-engineering)
- **SÃ©curitÃ©** : [Guide ConfidentialitÃ©](/docs?doc=guide-security-privacy)
- **Fine-Tuning** : [Adapter le modÃ¨le](/docs?doc=guide-fine-tuning)
