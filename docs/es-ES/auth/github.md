# Autenticación GitHub SSO

Esta guía explica cómo configurar el inicio de sesión único (SSO) de GitHub para su aplicación mAI.

## 🛠 Configuración en GitHub Developer Settings

1. Inicie sesión en GitHub y vaya a **Settings** > **Developer Settings** > **OAuth Apps**.
2. Haga clic en **Register a new application**.
3. Complete la información de la aplicación:
   - **Homepage URL**: La URL de su aplicación (por ejemplo: `https://mai-officiel.vercel.app` o `http://localhost:3010`)
   - **Authorization callback URL**:
     `https://mai-officiel.vercel.app/api/auth/callback/github` (o `http://localhost:3010/api/auth/callback/github` en desarrollo).
4. Haga clic en **Register application**.
5. Copie el **ID de cliente (Client ID)** y genere un nuevo **Secreto de cliente (Client Secret)**.

## 🔑 Variables de Entorno

Agregue las siguientes claves en su archivo `.env` o en su servidor de hosting:

```env
GITHUB_CLIENT_ID=su_client_id_github
GITHUB_CLIENT_SECRET=su_client_secret_github
```
