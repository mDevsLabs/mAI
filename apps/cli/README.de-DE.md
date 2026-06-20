# @lobehub/cli

mAI-Kommandozeilenschnittstelle (CLI).

## Lokale Entwicklung

| Aufgabe | Befehl |
| --- | --- |
| Im Dev-Modus ausführen | `bun run dev -- <befehl>` |
| CLI erstellen | `bun run build` |
| `lh`/`lobe`/`lobehub` in Ihrer Shell verknüpfen | `bun run cli:link` |
| Globale Verknüpfung entfernen | `bun run cli:unlink` |

- `bun run build` generiert nur `dist/index.js`.
- Um `lh` in Ihrer Shell verfügbar zu machen, führen Sie `bun run cli:link` aus.
- Wenn Ihre Shell nach dem Verknüpfen `lh` immer noch nicht finden kann, führen Sie `rehash` in `zsh` aus.

## Benutzerdefinierte Server-URL

Standardmäßig verbindet sich die CLI mit `https://app.lobehub.com`. Um sie auf einen anderen Server zu verweisen (z. B. eine lokale Instanz):

| Methode | Befehl | Persistenz |
| --- | --- | --- |
| Umgebungsvariable | `LOBEHUB_SERVER=http://localhost:4000 bun run dev -- <befehl>` | Nur aktueller Befehl |
| Login-Flag | `lh login --server http://localhost:4000` | Gespeichert unter `~/.lobehub/settings.json` |

Priorität: `LOBEHUB_SERVER` Umgebungsvariable > `settings.json` > Standard-Offizielle URL.
