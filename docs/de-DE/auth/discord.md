# Discord-SSO-Authentifizierung

Diese Anleitung erklärt, wie Sie die einmalige Anmeldung (SSO) über Discord für Ihre mAI-Anwendung konfigurieren.

## 🛠 Konfiguration im Discord Developer Portal

1. Rufen Sie das [Discord Developer Portal](https://discord.com/developers/applications) auf.
2. Klicken Sie auf **New Application** und vergeben Sie einen Namen.
3. Wechseln Sie im linken Menü zum Reiter **OAuth2**.
4. Klicken Sie im Bereich **Redirects** auf **Add Redirect** und fügen Sie folgende URI hinzu:
   `https://mai-officiel.vercel.app/api/auth/callback/discord` (oder `http://localhost:3010/api/auth/callback/discord` in der Entwicklung).
5. Speichern Sie die Änderungen.
6. Kopieren Sie die **Client-ID** (Client ID) und das **Client-Geheimnis** (Client Secret), die im Bereich **Client Information** angezeigt werden.

## 🔑 Umgebungsvariablen

Fügen Sie die folgenden Schlüssel zu Ihrer `.env`-Datei oder auf Ihrem Hosting-Server hinzu:

```env
DISCORD_CLIENT_ID=ihre_discord_client_id
DISCORD_CLIENT_SECRET=ihr_discord_client_secret
```
