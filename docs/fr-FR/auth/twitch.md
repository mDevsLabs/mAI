# Authentification Twitch SSO

Ce guide explique comment configurer l'authentification unique (SSO) Twitch pour votre application mAI.

## 🛠 Configuration sur Twitch Developer Console

1. Rendez-vous sur la [Twitch Developer Console](https://dev.twitch.tv/console).
2. Enregistrez votre application en cliquant sur **Register Your Application**.
3. Saisissez le nom de votre application.
4. Dans le champ **OAuth Redirect URLs**, configurez :
   `https://mai-officiel.vercel.app/api/auth/callback/twitch` (ou `http://localhost:3010/api/auth/callback/twitch` en développement).
5. Sélectionnez une catégorie appropriée (ex: **Application Integration**).
6. Cliquez sur **Create** puis accédez aux détails de l'application pour copier le **Client ID** et générer un nouveau **Client Secret**.

## 🔑 Variables d'Environnement

Ajoutez les clés suivantes dans votre fichier `.env` ou sur votre serveur d'hébergement :

```env
TWITCH_CLIENT_ID=votre_client_id_twitch
TWITCH_CLIENT_SECRET=votre_secret_client_twitch
```
