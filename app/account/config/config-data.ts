import { maiModelsList } from "@/maiModels";

export type ConfigTab = "openai" | "python" | "google" | "anthropic" | "curl";
export type ConfigHostTarget = "cloud" | "ollama" | "local";

/**
 * Aucun modèle cloud n'est codé en dur : le sélecteur Cloud de la page
 * Configuration ne propose que les modèles réellement retournés par
 * `GET /api/v1/models`. `DEFAULT_CLOUD_MODEL` reste vide jusqu'à la
 * réception du catalogue, puis le premier modèle reçu est sélectionné.
 */
export const DEFAULT_CLOUD_MODEL = "";
export const DEFAULT_LOCAL_MODEL =
  maiModelsList.find((model) => model.ollamaTag)?.ollamaTag || "mDevsLabs/mAI-1.5-Light";

const SNIPPET_API_KEY = "VOTRE_CLE_API";

export function getConfigBaseUrl(hostTarget: ConfigHostTarget): string {
  switch (hostTarget) {
    case "ollama":
      return "http://localhost:11434";
    case "local":
      return "http://localhost:3000/api";
    case "cloud":
    default:
      return "https://mai.val.run";
  }
}

export function buildConfigSnippet(params: {
  activeTab: ConfigTab;
  baseUrl: string;
  maxTokens: number;
  selectedModel: string;
  temperature: number;
}): string {
  const { activeTab, baseUrl, maxTokens, selectedModel, temperature } = params;
  switch (activeTab) {
    case "openai":
      return `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "${baseUrl}/v1",
  apiKey: "${SNIPPET_API_KEY}",
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "${selectedModel}",
    messages: [
      { role: "system", content: "Tu es un assistant IA très performant." },
      { role: "user", content: "Bonjour ! Rédige une brève présentation." }
    ],
    temperature: ${temperature},
    max_tokens: ${maxTokens},
  });

  console.log(completion.choices[0].message.content);
}

main();`;
    case "python":
      return `from openai import OpenAI

client = OpenAI(
    base_url="${baseUrl}/v1",
    api_key="${SNIPPET_API_KEY}"
)

response = client.chat.completions.create(
    model="${selectedModel}",
    messages=[
        {"role": "system", "content": "Tu es un assistant IA très performant."},
        {"role": "user", "content": "Bonjour ! Rédige une brève présentation."}
    ],
    temperature=${temperature},
    max_tokens=${maxTokens}
)

print(response.choices[0].message.content)`;
    case "google":
      return `// Configuration via SDK Google / OpenAI Compatibility
import { GoogleGenerativeAI } from "@google/generative-ai";
// Alternative directe via endpoint de compatibilité OpenAI
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${baseUrl}/v1",
  apiKey: "${SNIPPET_API_KEY}",
});

async function runGemini() {
  const response = await client.chat.completions.create({
    model: "${selectedModel}",
    messages: [{ role: "user", content: "Explique l'IA en une phrase." }],
    temperature: ${temperature},
  });
  console.log(response.choices[0].message.content);
}

runGemini();`;
    case "anthropic":
      return `import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  baseURL: "${baseUrl}",
  apiKey: "${SNIPPET_API_KEY}",
});

async function runAnthropic() {
  const message = await anthropic.messages.create({
    model: "${selectedModel}",
    max_tokens: ${maxTokens},
    messages: [
      { role: "user", content: "Bonjour Anthropic / mAI !" }
    ],
  });

  console.log(message.content[0].text);
}

runAnthropic();`;
    case "curl":
      return `curl ${baseUrl}/v1/chat/completions \\
  -H "Authorization: Bearer ${SNIPPET_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${selectedModel}",
    "messages": [
      {
        "role": "user",
        "content": "Hello, world!"
      }
    ],
    "temperature": ${temperature},
    "max_tokens": ${maxTokens}
  }'`;
  }
}
