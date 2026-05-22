# Datenbank-Verwaltung 🗄️

**mAI** verwaltet seine Datenspeicherung strukturiert und performant, um einen schnellen Offline-Zugriff auf Ihre Gespräche und Konfigurationen zu gewährleisten.

## Speicherarchitektur

Je nach Laufzeitumgebung (Desktop oder Web) nutzt mAI unterschiedliche Speicher-Engines:
- **Desktop-Anwendung**: Verwendet eine leichtgewichtige lokale Datenbank (SQLite), die im Anwenderverzeichnis der Anwendung gespeichert ist. Sie garantiert exzellente Lese- und Schreibleistung.
- **Web-Anwendung**: Basiert auf der internen Datenbank des Browsers (IndexedDB) oder externen API-Diensten, die mit einer PostgreSQL-Datenbank synchronisiert werden, wenn der Cloud-Modus aktiviert ist.

## Schema-Migrationen

mAI enthält ein automatisches Migrationssystem für das Datenbankschema. Bei jedem Anwendungsupdate werden Schemaänderungen nahtlos beim Start durchgeführt, ohne Ihre vorhandenen Daten zu verändern.
