# Google-SSO-Authentifizierung

Diese Anleitung erklärt, wie Sie die einmalige Anmeldung (SSO) über Google für Ihre mAI-Anwendung konfigurieren.

## 🛠 Konfiguration in der Google Cloud Console

1. Rufen Sie die [Google Cloud Console](https://console.cloud.google.com/) auf.
2. Erstellen Sie ein neues Projekt oder wählen Sie ein vorhandenes aus.
3. Gehen Sie zu **APIs & Dienste** > **OAuth-Zustimmungsbildschirm**. Konfigurieren Sie diesen als **Extern** und füllen Sie die erforderlichen Details aus.
4. Gehen Sie zu **Anmeldedaten** > **Anmeldedaten erstellen** > **OAuth-Client-ID**.
5. Wählen Sie **Webanwendung** als Anwendungstyp.
6. Konfigurieren Sie die folgenden URIs:
   - **Autorisierte JavaScript-Herkunftsquellen**: Die URL Ihrer Anwendung (z. B. `https://mai-officiel.vercel.app` oder `http://localhost:3010`)
   - **Autorisierte Weiterleitungs-URIs**:
     `https://mai-officiel.vercel.app/api/auth/callback/google` (oder `http://localhost:3010/api/auth/callback/google` in der Entwicklung).
7. Klicken Sie auf **Erstellen**, um Ihre **Client-ID** und Ihr **Client-Geheimnis** zu erhalten.

## 🔑 Umgebungsvariablen

Fügen Sie die folgenden Schlüssel zu Ihrer `.env`-Datei oder auf Ihrem Hosting-Server (z. B. Vercel) hinzu:

```env
GOOGLE_CLIENT_ID=ihre_google_client_id
GOOGLE_CLIENT_SECRET=ihr_google_client_secret
```
