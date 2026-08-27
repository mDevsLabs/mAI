---
title: "SDK Python"
description: "Guide d'installation et exemples de code Python pour interagir avec les API mAI."
category: "API"
order: 2
---

# SDK Python mDevsLabs (`mdevslabs-python`) 

Le SDK officiel Python pour l'écosystème **mDevsLabs** fournit un wrapper moderne, fortement typé avec Pydantic v2 et compatible `asyncio`.

---

## Installation

```bash
pip install mdevslabs-python
```

### Installation avec Support GPU

```bash
pip install "mdevslabs-python[gpu]"
```

---

## Exemple d'Utilisation Synchrone & Asynchrone

### Mode Synchrone

```python
from mdevslabs import mDevsClient

client = mDevsClient(base_url="http://localhost:11434")

response = client.generate(
    model="mai-1",
    prompt="Rédige une docstring Python pour une fonction de tri fusion."
)

print(response.text)
```

### Mode Asynchrone (Asyncio + Streaming)

```python
import asyncio
from mdevslabs import AsyncmDevsClient

async def main():
    async with AsyncmDevsClient() as client:
        stream = await client.chat.stream(
            model="mai-1",
            messages=[{"role": "user", "content": "Crée une classe FastAPI d'authentification."}]
        )
        async for chunk in stream:
            print(chunk.delta, end="", flush=True)

asyncio.run(main())
```

---

## API Reference

### Client Principaux

| Classe | Description |
|--------|-------------|
| `mDevsClient` | Client synchrones pour requêtes simples |
| `AsyncmDevsClient` | Client asynchrone avec support streaming |

### Méthodes Disponibles

#### Chat Completions

```python
# Génération simple
response = client.chat.completions.create(
    model="mai-1",
    messages=[
        {"role": "system", "content": "Tu es un expert en Python."},
        {"role": "user", "content": "Comment utiliser les generators ?"}
    ],
    temperature=0.7,
    max_tokens=500
)

# Streaming
async for chunk in client.chat.stream(...):
    print(chunk.delta, end="")
```

#### Embeddings

```python
embeddings = client.embeddings.create(
    model="mai-embeddings",
    input="Texte à vectoriser"
)
print(embeddings.data[0].embedding[:10])  # Affiche les 10 premiers vecteurs
```

#### Images (Vision)

```python
response = client.chat.completions.create(
    model="mai-1",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Quelles informations techniques voyez-vous ?"},
                {"type": "image_url", "image_url": {"url": "https://example.com/diagram.png"}}
            ]
        }
    ]
)
```

---

## Gestion des Erreurs

```python
from mdevslabs import mDevsClient
from mdevslabs.exceptions import (
    AuthenticationError,
    RateLimitError,
    InvalidRequestError
)

client = mDevsClient(api_key="mp-xxx")

try:
    response = client.chat.completions.create(...)
except AuthenticationError:
    print("Clé API invalide")
except RateLimitError as e:
    print(f"Limite atteinte: {e.retry_after}s")
except InvalidRequestError as e:
    print(f"Requête invalide: {e.message}")
```

---

## Configuration Avancée

### Timeout et Retry

```python
client = mDevsClient(
    base_url="http://localhost:11434",
    timeout=30.0,
    max_retries=3,
    retry_delay=1.0
)
```

### Proxy HTTP(S)

```python
client = mDevsClient(
    base_url="http://localhost:11434",
    proxy="http://proxy.company.com:8080"
)
```

---

## Exemples Avancés

### Chat avec Historique

```python
from mdevslabs import mDevsClient

client = mDevsClient()

# Conversation maintenue en mémoire
conversation = []

conversation.append({"role": "user", "content": "Salut !"})
conversation.append({"role": "assistant", "content": "Bonjour ! Comment puis-je vous aider ?"})
conversation.append({"role": "user", "content": "Explique-moi les transformeurs."})

response = client.chat.completions.create(
    model="mai-1",
    messages=conversation,
    temperature=0.3
)

print(response.choices[0].message.content)
```

### Tool Calling avec Fonctions

```python
from mdevslabs import mDevsClient

def search_knowledge_base(query: str) -> list[str]:
    """Recherche dans la base de connaissances."""
    print(f"Recherche: {query}")
    return ["Résultat 1", "Résultat 2"]

tools = [
    {
        "type": "function",
        "function": {
            "name": "search_knowledge_base",
            "description": "Recherche des informations dans la base de connaissances",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Requête de recherche"}
                },
                "required": ["query"]
            }
        }
    }
]

client = mDevsClient()
response = client.chat.completions.create(
    model="mai-1",
    messages=[{"role": "user", "content": "Quelles sont les dernières nouveautés mAI ?"}],
    tools=tools
)
```

---

## Ressources

- **Documentation API** : [Endpoints REST](/docs?doc=api-rest-endpoints)
- **Sécurité** : [Authentification](/docs?doc=api-security-authentication)
- **Prompt Engineering** : [Guide](/docs?doc=guide-prompt-engineering)
