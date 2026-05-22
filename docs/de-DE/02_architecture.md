# Anwendungsarchitektur 🏗️

Die Architektur von **mAI** ist so konzipiert, dass sie modular, erweiterbar und extrem performant ist. Sie basiert auf modernen Webtechnologien und einem flexiblen System.

## Architekturkomponenten

- **Frontend**: Entwickelt mit **Next.js** und **React**. Die Benutzeroberfläche nutzt moderne, responsive Design-Muster, um eine flüssige Benutzererfahrung auf Desktop- und Mobilgeräten zu gewährleisten.
- **Client-Side State Management**: Verwaltet mit **Zustand**, was eine reaktive und leichtgewichtige Zustandssynchronisierung ermöglicht.
- **Datenbankschicht**: Verwendet **Drizzle ORM** für die Kommunikation mit der Datenbank (SQLite lokal für Desktop, PostgreSQL optional für Cloud-Synchronisierung).
- **LLM-Integration**: Eine modulare API-Schicht, die Anfragen an verschiedene Anbieter (OpenAI, Anthropic, Gemini, Ollama) standardisiert und streamt.
