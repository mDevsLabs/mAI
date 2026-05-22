# Architettura dell'applicazione 🏗️

L'architettura di **mAI** è progettata per essere modulare, estensibile ed estremamente performante. Si basa su moderne tecnologie web e su un sistema flessibile.

## Componenti dell'architettura

- **Frontend**: Sviluppato con **Next.js** e **React**. L'interfaccia utente utilizza pattern di design moderni e reattivi per garantire un'esperienza fluida su desktop e dispositivi mobili.
- **Gestione dello stato del client**: Gestito con **Zustand**, che consente una sincronizzazione dello stato reattiva e leggera.
- **Strato Database**: Utilizza **Drizzle ORM** per la comunicazione con il database (SQLite locale per desktop, PostgreSQL opzionale per la sincronizzazione cloud).
- **Integrazione LLM**: Uno strato API modulare che standardizza e trasmette le richieste a diversi fornitori (OpenAI, Anthropic, Gemini, Ollama).
