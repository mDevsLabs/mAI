# Twitch SSO Authentication

This guide explains how to configure Twitch Single Sign-On (SSO) for your mAI application.

## 🛠 Configuration on Twitch Developer Console

1. Go to the [Twitch Developer Console](https://dev.twitch.tv/console).
2. Register your application by clicking on **Register Your Application**.
3. Enter your application's name.
4. In the **OAuth Redirect URLs** field, configure:
   `https://mai-officiel.vercel.app/api/auth/callback/twitch` (or `http://localhost:3010/api/auth/callback/twitch` in development).
5. Select an appropriate category (e.g., **Application Integration**).
6. Click on **Create** then go to the application details to copy the **Client ID** and generate a new **Client Secret**.

## 🔑 Environment Variables

Add the following keys to your `.env` file or on your hosting server:

```env
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```
