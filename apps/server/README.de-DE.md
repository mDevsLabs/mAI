# @mdevs/mai-server

Dieses Modul enthält die Backend-Dienste, tRPC-Router, Systemkonfigurationen und Workflows für die mAI-Serveranwendung.

## 📁 Projektstruktur

- **`src/featureFlags`**: Verwaltung und Bewertung von Feature-Flags.
- **`src/globalConfig`**: Globale Systemkonfigurationen des Servers.
- **`src/routers`**: Definition von tRPC-Routern, die sichere und typensichere APIs für den Client bereitstellen.
- **`src/services`**: Interne Infrastrukturdienste (z. B. E-Mail-Dienst, Datenbanken).
- **`src/workflows`**: Asynchrone Workflows und Aufgabenverwaltung mit Upstash/QStash.

## 🚀 Entwicklung & Validierung

So führen Sie die TypeScript-Typprüfung für das Serverprojekt durch:

```bash
pnpm type-check
```
