# 🤯 mAI Desktop-Anwendung

mAI Desktop ist eine plattformübergreifende Desktop-Anwendung für [mAI](https://github.com/mDevsLabs/mAI), entwickelt mit Electron, die eine native Desktop-Erfahrung und erweiterte Funktionalitäten bietet.

## ✨ Funktionen

- **🌍 Plattformübergreifende Unterstützung**: Unterstützt macOS (Intel/Apple Silicon), Windows und Linux-Systeme
- **🔄 Automatische Updates**: Der integrierte Update-Mechanismus stellt sicher, dass Sie immer die neueste Version verwenden
- **🌐 Mehrsprachige Unterstützung**: Vollständige i18n-Unterstützung für über 18 Sprachen mit Lazy Loading
- **🎨 Native Integration**: Tiefe OS-Integration mit nativen Menüs, Tastenkombinationen und Benachrichtigungen
- **🔒 Sicher & Zuverlässig**: macOS notariell beglaubigt, verschlüsselter Token-Speicher, sicherer OAuth-Ablauf
- **📦 Mehrere Release-Kanäle**: Stabile, Beta- und Nightly-Build-Versionen
- **⚡ Erweiterte Fensterverwaltung**: Multi-Fenster-Architektur mit Designsynchronisierung
- **🔗 Synchronisation mit Remote-Server**: Sichere Datensynchronisation mit entfernten mAI-Instanzen
- **🎯 Entwicklerwerkzeuge**: Integriertes Entwickler-Panel und umfassende Debugging-Tools

## 🚀 Entwicklungs-Setup

### Voraussetzungen

- **Node.js** 22+
- **pnpm** 10+
- **Electron**-kompatible Entwicklungsumgebung

### Schnellstart

```bash
# Abhängigkeiten installieren
pnpm install-isolated

# Entwicklungsserver starten
pnpm dev

# Typprüfung
pnpm type-check

# Tests ausführen
pnpm test
```

### Umgebungskonfiguration

Kopieren Sie `.env.desktop` nach `.env` und konfigurieren Sie nach Bedarf:

```bash
cp .env.desktop .env
```

> [!WARNING]
> Sichern Sie Ihre `.env`-Datei vor Änderungen, um Konfigurationsverluste zu vermeiden.

### Build-Befehle

| Befehl                     | Beschreibung                                |
| -------------------------- | ------------------------------------------- |
| `pnpm build:main`          | Hauptprozess/Preload erstellen (nur dist)   |
| `pnpm package:mac`         | Paket für macOS (Intel + Apple Silicon)     |
| `pnpm package:win`         | Paket für Windows                           |
| `pnpm package:linux`       | Paket für Linux                             |
| `pnpm package:local`       | Lokales Paket erstellen (ohne ASAR)         |
| `pnpm package:local:reuse` | Lokales Paket unter Wiederverwendung von dist|

### Entwicklungs-Workflow

```bash
# 1. Entwicklung
pnpm dev # Mit Hot Reload starten

# 2. Codequalität
pnpm lint       # ESLint-Prüfung
pnpm format     # Prettier-Formatierung
pnpm type-check # TypeScript-Validierung

# 3. Testen
pnpm test # Vitest-Tests ausführen
```

## 🎯 Release-Kanäle

| Kanal       | Beschreibung                                       | Stabilität | Auto-Updates |
| ----------- | -------------------------------------------------- | ---------- | ------------ |
| **Stable**  | Gründlich getestete Versionen                      | 🟢 Hoch    | ✅ Ja        |
| **Beta**    | Vorabversionen mit neuen Funktionen                | 🟡 Mittel  | ✅ Ja        |
| **Nightly** | Tägliche Builds mit den neuesten Änderungen        | 🟠 Niedrig | ✅ Ja        |

## 🛠 Technologie-Stack

- **Electron** `37.1.0` - Desktop-Framework
- **Node.js** `22+` - Backend-Runtime
- **TypeScript** `5.7+` - Typsichere Entwicklung
- **Vite** `6.2+` - Build-Tooling

## 🏗 Architektur

Die Desktop-Anwendung verwendet ein ausgereiftes System aus Dependency Injection und ereignisgesteuerter Architektur.

### 📁 Kernstruktur

```
src/main/core/
├── App.ts                    # 🎯 Hauptanwendungs-Orchestrator
├── IoCContainer.ts           # 🔌 Dependency Injection Container
├── window/                   # 🪟 Fensterverwaltungs-Module
│   ├── WindowThemeManager.ts     # 🎨 Designsynchronisierung
│   ├── WindowPositionManager.ts  # 📐 Positions-Persistenz
│   ├── WindowErrorHandler.ts     # ⚠️  Fehlerbehandlung
│   └── WindowConfigBuilder.ts    # ⚙️  Konfigurations-Builder
└── infrastructure/           # 🔧 Infrastrukturdienste
    ├── StoreManager.ts          # 💾 Konfigurationsspeicher
    ├── I18nManager.ts           # 🌍 Internationalisierung
    └── StaticFileServerManager.ts # 🗂️ Lokaler Dateiserver
```

## 🔒 Sicherheit

- **OAuth 2.0-Ablauf** mit PKCE für sicheren Token-Austausch.
- **Verschlüsselter Token-Speicher** über die native Tresor-API des Betriebssystems.
- **Notarisierung für macOS** zum Schutz vor Schadsoftware.
