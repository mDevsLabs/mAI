# Autenticación Spotify SSO

Esta guía explica cómo configurar el inicio de sesión único (SSO) de Spotify para su aplicación mAI.

## 🛠 Configuración en Spotify Developer Dashboard

1. Inicie sesión en el [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Haga clic en **Create app**.
3. Complete el nombre y la descripción de su aplicación.
4. En el campo **Redirect URIs**, configure la siguiente URL:
   `https://mai-officiel.vercel.app/api/auth/callback/spotify` (o `http://localhost:3010/api/auth/callback/spotify` en desarrollo).
5. Acepte los términos de uso y haga clic en **Save**.
6. En la página de configuración de su aplicación, copie el **Client ID** y haga clic en **View client secret** para copiar el **Client Secret**.

## 🔑 Variables de Entorno

Agregue las siguientes claves en su archivo `.env` o en su servidor de hosting:

```env
SPOTIFY_CLIENT_ID=su_client_id_spotify
SPOTIFY_CLIENT_SECRET=su_client_secret_spotify
```
