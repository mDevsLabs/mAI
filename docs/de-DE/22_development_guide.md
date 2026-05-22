# Entwicklerhandbuch 🛠️

Dieses Handbuch bietet grundlegende Anweisungen für Entwickler, die zum **mAI**-Projekt beitragen oder den Quellcode im Entwicklungsmodus ausführen möchten.

## Projektstruktur

mAI ist als modernes Monorepo strukturiert (unter Verwendung von pnpm und Turborepo):
- `apps/web`: Die Hauptanwendung in Next.js.
- `packages/`: Gemeinsam genutzte Module und wiederverwendbare Konfigurationen (UI-Komponenten, Typen, Hilfsprogramme).

## Ausführung im Entwicklungsmodus

1. **Voraussetzungen**: Stellen Sie sicher, dass Node.js (LTS empfohlen) und pnpm installiert sind.
2. **Abhängigkeiten installieren**:
   ```bash
   pnpm install
   ```
3. **Dev-Server starten**:
   ```bash
   pnpm run dev
   ```
   Die Anwendung ist lokal unter `http://localhost:3000` erreichbar.

## Testen

Wir verwenden **Vitest** für unsere Test-Suiten:
- Tests einmal ausführen: `pnpm run test`
- Tests im Watch-Modus ausführen: `pnpm run test:watch`
