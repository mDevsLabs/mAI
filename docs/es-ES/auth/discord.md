# Autenticación Discord SSO

Esta guía explica cómo configurar el inicio de sesión único (SSO) de Discord para su aplicación mAI.

## 🛠 Configuración en Discord Developer Portal

1. Vaya al [Discord Developer Portal](https://discord.com/developers/applications).
2. Haga clic en **New Application** y asígnele un nombre.
3. Vaya a la pestaña **OAuth2** en el menú de la izquierda.
4. En la sección **Redirects**, haga clic en **Add Redirect** y agregue la siguiente URI:
   `https://mai-officiel.vercel.app/api/auth/callback/discord` (o `http://localhost:3010/api/auth/callback/discord` en desarrollo).
5. Guarde los cambios.
6. Copie el **Client ID** y el **Client Secret** visibles en la sección **Client Information**.

## 🔑 Variables de Entorno

Agregue las siguientes claves en su archivo `.env` o en su servidor de hosting:

```env
DISCORD_CLIENT_ID=su_client_id_discord
DISCORD_CLIENT_SECRET=su_client_secret_discord
```
