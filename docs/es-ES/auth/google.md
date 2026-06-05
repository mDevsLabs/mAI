# Autenticación Google SSO

Esta guía explica cómo configurar el inicio de sesión único (SSO) de Google para su aplicación mAI.

## 🛠 Configuración en Google Cloud Console

1. Vaya a la [Google Cloud Console](https://console.cloud.google.com/).
2. Cree un nuevo proyecto o seleccione uno existente.
3. Vaya a **API y servicios** > **Pantalla de consentimiento de OAuth**. Configúrela en modo **Externo** y complete los detalles solicitados.
4. Vaya a **Credenciales** > **Crear credenciales** > **ID de cliente de OAuth**.
5. Seleccione **Aplicación web** como tipo de aplicación.
6. Configure las siguientes URIs:
   - **Orígenes de JavaScript autorizados**: La URL de su aplicación (por ejemplo: `https://mai-officiel.vercel.app` o `http://localhost:3010`)
   - **URIs de redireccionamiento autorizados**:
     `https://mai-officiel.vercel.app/api/auth/callback/google` (o `http://localhost:3010/api/auth/callback/google` en desarrollo).
7. Haga clic en **Crear** para obtener su **ID de cliente** y su **Secreto de cliente**.

## 🔑 Variables de Entorno

Agregue las siguientes claves en su archivo `.env` o en su servidor de hosting (por ejemplo: Vercel):

```env
GOOGLE_CLIENT_ID=su_client_id_google
GOOGLE_CLIENT_SECRET=su_client_secret_google
```
