# Spotify SSO Authentication

This guide explains how to configure Spotify Single Sign-On (SSO) for your mAI application.

## 🛠 Configuration on Spotify Developer Dashboard

1. Log in to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Click on **Create app**.
3. Fill in the name and description of your application.
4. In the **Redirect URIs** field, configure the following URL:
   `https://mai-officiel.vercel.app/api/auth/callback/spotify` (or `http://localhost:3010/api/auth/callback/spotify` in development).
5. Accept the terms of service and click on **Save**.
6. On your application's settings page, copy the **Client ID** and click on **View client secret** to copy the **Client Secret**.

## 🔑 Environment Variables

Add the following keys to your `.env` file or on your hosting server:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```
