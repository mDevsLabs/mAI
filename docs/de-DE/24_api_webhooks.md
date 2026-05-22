# API und Webhooks 🔗

**mAI** bietet programmierbare Schnittstellen, um externe Integrationen mit Ihren eigenen Anwendungen, Webdiensten oder Automatisierungsskripten zu ermöglichen.

## Lokale API (HTTP)

Die mAI Desktop-App kann einen sicheren lokalen Webserver auf einem bestimmten Port ausführen. Dieser Server stellt mehrere Endpunkte bereit:
- `POST /api/chat`: Sendet eine Nachricht an einen bestimmten Agenten und gibt eine strukturierte Antwort zurück.
- `GET /api/agents`: Listet alle verfügbaren Agenten und deren Konfigurationen auf.
- `POST /api/agents`: Ermöglicht die programmatische Erstellung eines neuen Agenten.

## Webhooks-Integration

Sie können ausgehende Webhooks in den erweiterten Einstellungen von mAI konfigurieren. Ein Webhook sendet automatisch eine JSON-Nutzlast an eine externe URL, wenn bestimmte Ereignisse eintreffen (z. B. Beendigung einer Agentenantwort).
