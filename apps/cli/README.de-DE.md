# @mdevs/mai-cli

mAI-Kommandozeilenschnittstelle (CLI).

## Lokale Entwicklung

| Aufgabe | Befehl |
| --- | --- |
| Im Dev-Modus ausführen | `bun run dev -- <befehl>` |
| CLI erstellen | `bun run build` |
| `mai` in Ihrer Shell verknüpfen | `bun run cli:link` |
| Globale Verknüpfung entfernen | `bun run cli:unlink` |

- `bun run build` generiert nur `dist/index.js`.
- Um `mai` in Ihrer Shell verfügbar zu machen, führen Sie `bun run cli:link` aus.
- Wenn Ihre Shell nach dem Verknüpfen `mai` immer noch nicht finden kann, führen Sie `rehash` in `zsh` aus.

## Benutzerdefinierte Server-URL

Standardmäßig verbindet sich die CLI mit `https://mai-officiel.vercel.app`. Um sie auf einen anderen Server zu verweisen (z. B. eine lokale Instanz):

| Methode | Befehl | Persistenz |
| --- | --- | --- |
| Umgebungsvariable | `MAI_SERVER=http://localhost:4000 bun run dev -- <befehl>` | Nur aktueller Befehl |
| Login-Flag | `mai login --server http://localhost:4000` | Gespeichert unter `~/.mai/settings.json` |

Priorität: `MAI_SERVER` Umgebungsvariable > `settings.json` > Standard-Offizielle URL.
