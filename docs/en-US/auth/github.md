# GitHub SSO Authentication

This guide explains how to configure GitHub Single Sign-On (SSO) for your mAI application.

## 🛠 Configuration on GitHub Developer Settings

1. Log in to GitHub and go to your **Settings** > **Developer Settings** > **OAuth Apps**.
2. Click on **Register a new application**.
3. Fill in the application details:
   - **Homepage URL**: Your application's URL (e.g., `https://mai-officiel.vercel.app` or `http://localhost:3010`)
   - **Authorization callback URL**:
     `https://mai-officiel.vercel.app/api/auth/callback/github` (or `http://localhost:3010/api/auth/callback/github` in development).
4. Click on **Register application**.
5. Copy the **Client ID** and generate a new **Client Secret**.

## 🔑 Environment Variables

Add the following keys to your `.env` file or on your hosting server:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```
