# Twitch-SSO-Authentifizierung

Diese Anleitung erklärt, wie Sie die einmalige Anmeldung (SSO) über Twitch für Ihre mAI-Anwendung konfigurieren.

## 🛠 Konfiguration in der Twitch Developer Console

1. Rufen Sie die [Twitch Developer Console](https://dev.twitch.tv/console) auf.
2. Registrieren Sie Ihre Anwendung, indem Sie auf **Register Your Application** klicken.
3. Geben Sie den Namen Ihrer Anwendung ein.
4. Konfigurieren Sie im Feld **OAuth Redirect URLs**:
   `https://mai-officiel.vercel.app/api/auth/callback/twitch` (oder `http://localhost:3010/api/auth/callback/twitch` in der Entwicklung).
5. Wählen Sie eine passende Kategorie (z. B. **Application Integration**).
6. Klicken Sie auf **Create** und rufen Sie die Anwendungsdetails auf, um die **Client-ID** zu kopieren und ein neues **Client-Geheimnis** zu generieren.

## 🔑 Umgebungsvariablen

Fügen Sie die folgenden Schlüssel zu Ihrer `.env`-Datei oder auf Ihrem Hosting-Server hinzu:

```env
TWITCH_CLIENT_ID=ihre_twitch_client_id
TWITCH_CLIENT_SECRET=ihr_twitch_client_secret
```
