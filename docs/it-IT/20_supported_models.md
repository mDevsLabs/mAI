# Modelli di linguaggio supportati 🧠

**mAI** è un'interfaccia indipendente dai modelli. Supporta un'ampia varietà di fornitori di intelligenza artificiale basati su cloud commerciali e open source locali.

## Principali fornitori Cloud

Puoi configurare i seguenti fornitori cloud inserendo la tua chiave API personale:
- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5, ecc.
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku.
- **Google Gemini**: Gemini 1.5 Pro, Gemini 1.5 Flash.
- **Mistral AI**: Mistral Large, Mistral Medium, Codestral.
- **Groq**: Accesso ultra-veloce a modelli open source come Llama 3 e Mixtral.

## Integrazione di modelli locali

Per gli utenti che desiderano la massima privacy dei propri dati, mAI supporta l'esecuzione locale:
- **Ollama**: Integrazione nativa semplificata. Avvia Ollama in background e mAI rileverà automaticamente i tuoi modelli installati localmente (come Llama 3 o Mistral).
- **API compatibili con OpenAI**: Collega qualsiasi server di inferenza locale o remoto (come LM Studio) specificando l'URL di base dell'API personalizzato.
