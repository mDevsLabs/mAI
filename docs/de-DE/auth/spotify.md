# Spotify-SSO-Authentifizierung

Diese Anleitung erklärt, wie Sie die einmalige Anmeldung (SSO) über Spotify für Ihre mAI-Anwendung konfigurieren.

## 🛠 Konfiguration im Spotify Developer Dashboard

1. Melden Sie sich im [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) an.
2. Klicken Sie auf **Create app**.
3. Füllen Sie den Namen und die Beschreibung Ihrer Anwendung aus.
4. Konfigurieren Sie im Feld **Redirect URIs** folgende URL:
   `https://mai-officiel.vercel.app/api/auth/callback/spotify` (oder `http://localhost:3010/api/auth/callback/spotify` in der Entwicklung).
5. Akzeptieren Sie die Nutzungsbedingungen und klicken Sie auf **Save**.
6. Kopieren Sie auf der Einstellungsseite Ihrer Anwendung die **Client ID** und klicken Sie auf **View client secret**, um das **Client Secret** zu kopieren.

## 🔑 Umgebungsvariablen

Fügen Sie die folgenden Schlüssel zu Ihrer `.env`-Datei oder auf Ihrem Hosting-Server hinzu:

```env
SPOTIFY_CLIENT_ID=ihre_spotify_client_id
SPOTIFY_CLIENT_SECRET=ihr_spotify_client_secret
```
