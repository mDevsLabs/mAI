# GitHub-SSO-Authentifizierung

Diese Anleitung erklärt, wie Sie die einmalige Anmeldung (SSO) über GitHub für Ihre mAI-Anwendung konfigurieren.

## 🛠 Konfiguration in den GitHub Developer Settings

1. Melden Sie sich bei GitHub an und gehen Sie zu **Settings** > **Developer Settings** > **OAuth Apps**.
2. Klicken Sie auf **Register a new application**.
3. Füllen Sie die Informationen zur Anwendung aus:
   - **Homepage URL**: Die URL Ihrer Anwendung (z. B. `https://mai-officiel.vercel.app` oder `http://localhost:3010`)
   - **Authorization callback URL**:
     `https://mai-officiel.vercel.app/api/auth/callback/github` (oder `http://localhost:3010/api/auth/callback/github` in der Entwicklung).
4. Klicken Sie auf **Register application**.
5. Kopieren Sie die **Client-ID (Client ID)** und generieren Sie ein neues **Client-Geheimnis (Client Secret)**.

## 🔑 Umgebungsvariablen

Fügen Sie die folgenden Schlüssel zu Ihrer `.env`-Datei oder auf Ihrem Hosting-Server hinzu:

```env
GITHUB_CLIENT_ID=ihre_github_client_id
GITHUB_CLIENT_SECRET=ihr_github_client_secret
```
