---
title: "Framework"
description: "Framework de connecteurs d'API, outils d'exécution (tool calls) et orchestration."
category: "API"
order: 4
---

# mDevsLabs Agent Framework 

Le **mDevsLabs Agent Framework** est la bibliothèque d'orchestration permettant de créer des équipes d'agents IA autonomes coopérant pour résoudre des tâches complexes.

---

## Modèle d'Agent Autonome

Un agent dans le framework est défini par :
1. **Un Rôle & Une Persona** (`system_prompt`).
2. **Une Liste d'Outils Autorisés** (`tools`).
3. **Un Moteur de Raisonnement** (`mAI-Reasoning`).
4. **Une Mémoire d'Échange** (`memory_store`).

---

## Exemple de Code d'un Agent Multi-Outils

```python
from mdevslabs.agents import Agent, Tool, Runner

def get_current_weather(location: str) -> str:
    return f"Le temps à {location} est ensoleillé avec 22°C."

weather_tool = Tool.from_function(get_current_weather)

assistant = Agent(
    name="AssistantMeteo",
    model="mai-1",
    tools=[weather_tool],
    instructions="Réponds aux questions météo en utilisant l'outil get_current_weather."
)

result = Runner.run_sync(assistant, "Quel temps fait-il à Paris ?")
print(result.final_output)
```

---

## Types d'Outils Disponibles

| Type | Description | Exemple |
|------|-------------|---------|
| `function` | Appel de fonction Python/JS | Calculs, API REST |
| `code` | Exécution de code isolé | Analyse, transformation |
| `database` | Interrogation de bases | SQL, NoSQL |
| `file` | Lecture/écriture fichiers | Documents, logs |
| `web` | Navigation web | Scraping, recherche |

---

## Définition d'un Outil Personnalisé

### En Python

```python
from mdevslabs.agents import Tool

def search_database(query: str, limit: int = 5) -> list[dict]:
    """Recherche dans la base de données clients."""
    # Implémentation...
    return [{"id": 1, "name": "Client A"}]

search_tool = Tool.from_function(
    func=search_database,
    name="search_database",
    description="Rechercher des clients dans la base",
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "limit": {"type": "integer", "default": 5}
        },
        "required": ["query"]
    }
)
```

### En TypeScript/JavaScript

```typescript
import { Tool } from '@mdevslabs/sdk';

const databaseTool = new Tool({
  name: 'query_database',
  description: 'Exécuter une requête SQL',
  parameters: z.object({
    sql: z.string().describe('Requête SQL à exécuter'),
    limit: z.number().optional().default(100)
  }),
  execute: async ({ sql, limit }) => {
    // Votre logique...
    return { rows: [], count: 0 };
  }
});
```

---

## Orchestration d'Équipe d'Agents

```python
from mdevslabs.agents import Team, Agent, Runner

# Agent 1 : Analyse des documents
analyzer = Agent(
    name="Analyzer",
    model="mai-1-light",
    tools=[file_reader_tool],
    instructions="Analyse les documents et extrait les points clés."
)

# Agent 2 : Rédaction
writer = Agent(
    name="Writer",
    model="mai-1",
    tools=[text_editor_tool],
    instructions="Rédige un rapport professionnel."
)

# Équipe
team = Team(agents=[analyzer, writer])

result = Runner.run_sync(
    team,
    "Analyse ce document et crée un résumé professionnel."
)
print(result.final_output)
```

---

## Gestion de l'État

### Mémoire Court Terme

```python
from mdevslabs.memory import ConversationMemory

memory = ConversationMemory(max_tokens=8192)

agent = Agent(
    name="ChatBot",
    model="mai-1",
    memory=memory,
    instructions="Sois amical et professionnel."
)

# La mémoire est maintenue automatiquement entre les appels
```

### Mémoire Long Terme (Vectorielle)

```python
from mdevslabs.memory import SemanticMemory

semantic_memory = SemanticMemory(
    store_path="./memory.db",
    embedding_model="mai-embeddings"
)

# Ajouter des faits à mémoriser
await semantic_memory.add(
    key="user_preference",
    value="L'utilisateur préfère les réponses en français.",
    metadata={"user_id": "123"}
)

# Récupérer des faits pertinents
facts = await semantic_memory.search("langue préférée", top_k=3)
```

---

## Sécurité des Agents

### Sandbox d'Exécution

Tous les outils sont exécutés dans un sandbox isolé :

```python
from mdevslabs.security import Sandbox

sandbox = Sandbox(
    timeout=30,  # 30 secondes max
    memory_limit="512MB",
    allowed_functions=["read_file", "http_get"]
)

agent = Agent(
    name="SecureAgent",
    model="mai-1",
    tools=[sandbox.wrap(tools)],  # Outils enveloppés dans le sandbox
    instructions="Sois prudent avec l'exécution de code."
)
```

---

## Monitoring & Debugging

```python
from mdevslabs.debugging import Debugger

debugger = Debugger(agent)

# Activer le logging détaillé
debugger.enable_logging(level="DEBUG")

# Exécuter avec tracing
result = debugger.run_sync(
    agent,
    "Calcule la somme de 2 + 2",
    trace=True
)

# Voir le plan de raisonnement
print(debugger.get_reasoning_trace())
```

---

## Déploiement

### Docker

```dockerfile
FROM mdevslabs/agent-runtime:latest

COPY tools/ /app/tools/
COPY agents/ /app/agents/

ENV MODEL_NAME=mai-1
ENV OLLAMA_HOST=http://ollama:11434

CMD ["python", "-m", "mdevslabs.agent.runner", "--config", "/app/config.yaml"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: agent
  template:
    spec:
      containers:
      - name: agent
        image: mdevslabs/agent:latest
        env:
        - name: MODEL_NAME
          value: "mai-1"
        resources:
          limits:
            nvidia.com/gpu: 1
```

---

## Ressources

- **Architecture système** : [Vue d'ensemble](/docs?doc=arch-system-architecture)
- **RAG Pipeline** : [Recherche augmentée](/docs?doc=arch-rag-pipeline)
- **Exemples Python** : [Documentation complète](https://docs.mdevslabs.ai)
