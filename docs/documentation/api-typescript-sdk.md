---
title: "SDK TypeScript"
description: "Intégration Web & Node.js avec streaming de réponses et typage strict."
category: "API"
order: 3
---

# SDK TypeScript / JavaScript (`@mdevslabs/sdk`) 🟨⚡

Le SDK officiel `@mdevslabs/sdk` permet d'intégrer facilement les services **mAI** et **mSearch** dans vos applications Web (Next.js, React, Vue, Svelte) et serveurs (Node.js, Bun, Deno).

---

## 📦 Installation

```bash
npm install @mdevslabs/sdk
# ou via pnpm
pnpm add @mdevslabs/sdk
# ou via yarn
yarn add @mdevslabs/sdk
```

---

## 💻 Exemple d'Usage dans Next.js Server Action

```typescript
import { mDevsClient } from '@mdevslabs/sdk';

const client = new mDevsClient({
  apiKey: process.env.MDEVS_API_KEY,
  baseUrl: 'https://mai-devs.vercel.app/api/v1/',
});

export async function askAssistant(question: string) {
  const result = await client.chat.completions.create({
    model: 'mai-1',
    messages: [{ role: 'user', content: question }],
    temperature: 0.7,
  });

  return result.choices[0].message.content;
}
```

---

## 🌊 Streaming Web API Exemple

```typescript
import { mDevsClient } from '@mdevslabs/sdk';

const client = new mDevsClient({ apiKey: 'mp-xxx' });

async function streamResponse() {
  const responseStream = await client.chat.completions.create({
    model: 'mai-1',
    messages: [{ role: 'user', content: 'Raconte une histoire courte.' }],
    stream: true,
  });

  let fullText = '';
  for await (const chunk of responseStream) {
    const content = chunk.choices[0]?.delta?.content || '';
    fullText += content;
    process.stdout.write(content);
  }
  return fullText;
}
```

---

## 📚 Types & Interfaces

### Principaux Types

```typescript
interface ChatCompletion {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: 'assistant'; content: string };
    finish_reason: 'stop' | 'length' | 'content_filter' | 'function_call' | 'tool_calls';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ChatCompletionMessageParam {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
}
```

### Options de Configuration

```typescript
interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
}
```

---

## 🔧 Fonctionnalités Avancées

### Recherche Hybride avec mSearch

```typescript
const result = await client.search.hybrid({
  query: 'documentation TypeScript',
  limit: 10,
  collection: 'docs',
  filters: { category: 'technical' },
  rerank: true,
});

console.log(result.results.map(r => r.document.title));
```

### Génération d'Embeddings

```typescript
const embeddings = await client.embeddings.create({
  model: 'mai-embeddings',
  input: 'Le machine learning est une discipline de l\'IA.',
});

const vector = embeddings.data[0].embedding;
console.log(`Dimension: ${vector.length}`); // 768
```

### Tool Calling

```typescript
const response = await client.chat.completions.create({
  model: 'mai-1',
  messages: [{ role: 'user', content: 'Quel temps fait-il à Paris ?' }],
  tools: [{
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Obtenir la météo actuelle',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' }
        },
        required: ['location']
      }
    }
  }],
  tool_choice: 'auto',
});

if (response.choices[0].message.tool_calls) {
  const toolCall = response.choices[0].message.tool_calls[0];
  console.log(`Tool: ${toolCall.function.name}`);
}
```

---

## 🛡️ Gestion des Erreurs

```typescript
import { mDevsClient, APIError } from '@mdevslabs/sdk';

const client = new mDevsClient({ apiKey: 'mp-xxx' });

try {
  const response = await client.chat.completions.create({
    model: 'mai-1',
    messages: [{ role: 'user', content: 'Bonjour' }],
  });
} catch (error) {
  if (error instanceof APIError) {
    console.error(`HTTP ${error.status}: ${error.message}`);
    if (error.status === 429) {
      console.log(`Retry after: ${error.retryAfter}s`);
    }
  }
}
```

---

## 🌐 Utilisation côté Navigateur (Browser)

```typescript
import { mDevsClient } from '@mdevslabs/sdk';

// Le SDK détecte automatiquement l'environnement
const client = new mDevsClient({
  apiKey: process.env.NEXT_PUBLIC_MDEVS_API_KEY,
  baseUrl: 'https://mai-devs.vercel.app/api/v1/',
});

// Utilisation dans un composant React
function ChatComponent() {
  const [response, setResponse] = useState('');

  const sendMessage = async () => {
    const result = await client.chat.completions.create({
      model: 'mai-1',
      messages: [{ role: 'user', content: 'Bonjour' }],
    });
    setResponse(result.choices[0].message.content);
  };

  return (
    <div>
      <button onClick={sendMessage}>Envoyer</button>
      <p>{response}</p>
    </div>
  );
}
```

---

## 📚 Ressources

- **Documentation Python** : [SDK Python](/docs?doc=api-python-sdk)
- **Sécurité** : [Authentification](/docs?doc=api-security-authentication)
- **Bonnes pratiques** : [Guide API](/docs?doc=api-best-practices)
