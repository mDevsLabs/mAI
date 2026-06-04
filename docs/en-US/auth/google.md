# Google SSO Authentication

This guide explains how to configure Google Single Sign-On (SSO) for your mAI application.

## 🛠 Configuration on Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Go to **APIs & Services** > **OAuth consent screen**. Configure it as **External** and fill in the requested details.
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**.
5. Select **Web application** as the application type.
6. Configure the following URIs:
   - **Authorized JavaScript origins**: Your application's URL (e.g., `https://mai-officiel.vercel.app` or `http://localhost:3010`)
   - **Authorized redirect URIs**:
     `https://mai-officiel.vercel.app/api/auth/callback/google` (or `http://localhost:3010/api/auth/callback/google` in development).
7. Click on **Create** to obtain your **Client ID** and **Client Secret**.

## 🔑 Environment Variables

Add the following keys to your `.env` file or on your hosting server (e.g., Vercel):

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```
