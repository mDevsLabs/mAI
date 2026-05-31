# Autenticación Twitch SSO

Esta guía explica cómo configurar el inicio de sesión único (SSO) de Twitch para su aplicación mAI.

## 🛠 Configuración en Twitch Developer Console

1. Vaya a la [Twitch Developer Console](https://dev.twitch.tv/console).
2. Registre su aplicación haciendo clic en **Register Your Application**.
3. Ingrese el nombre de su aplicación.
4. En el campo **OAuth Redirect URLs**, configure:
   `https://mai-officiel.vercel.app/api/auth/callback/twitch` (o `http://localhost:3010/api/auth/callback/twitch` en desarrollo).
5. Seleccione una categoría adecuada (por ejemplo: **Application Integration**).
6. Haga clic en **Create** y luego acceda a los detalles de la aplicación para copiar el **Client ID** y generar un nuevo **Client Secret**.

## 🔑 Variables de Entorno

Agregue las siguientes claves en su archivo `.env` o en su servidor de hosting:

```env
TWITCH_CLIENT_ID=su_client_id_twitch
TWITCH_CLIENT_SECRET=su_client_secret_twitch
```
