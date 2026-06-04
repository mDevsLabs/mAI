# Discord SSO Authentication

This guide explains how to configure Discord Single Sign-On (SSO) for your mAI application.

## 🛠 Configuration on Discord Developer Portal

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click on **New Application** and give it a name.
3. Go to the **OAuth2** tab in the left-hand menu.
4. In the **Redirects** section, click on **Add Redirect** and add the following URI:
   `https://mai-officiel.vercel.app/api/auth/callback/discord` (or `http://localhost:3010/api/auth/callback/discord` in development).
5. Save the changes.
6. Copy the **Client ID** and **Client Secret** visible in the **Client Information** section.

## 🔑 Environment Variables

Add the following keys to your `.env` file or on your hosting server:

```env
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```
