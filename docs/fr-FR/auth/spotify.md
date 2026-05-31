# Authentification Spotify SSO

Ce guide explique comment configurer l'authentification unique (SSO) Spotify pour votre application mAI.

## 🛠 Configuration sur Spotify Developer Dashboard

1. Connectez-vous sur le [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Cliquez sur **Create app**.
3. Remplissez le nom et la description de votre application.
4. Dans le champ **Redirect URIs**, configurez l'URL suivante :
   `https://mai-officiel.vercel.app/api/auth/callback/spotify` (ou `http://localhost:3010/api/auth/callback/spotify` en développement).
5. Acceptez les conditions d'utilisation et cliquez sur **Save**.
6. Dans la page des paramètres de votre application, copiez le **Client ID** et cliquez sur **View client secret** pour copier le **Client Secret**.

## 🔑 Variables d'Environnement

Ajoutez les clés suivantes dans votre fichier `.env` ou sur votre serveur d'hébergement :

```env
SPOTIFY_CLIENT_ID=votre_client_id_spotify
SPOTIFY_CLIENT_SECRET=votre_secret_client_spotify
```
