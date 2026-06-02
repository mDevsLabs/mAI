# Authentification GitHub SSO

Ce guide explique comment configurer l'authentification unique (SSO) GitHub pour votre application mAI.

## 🛠 Configuration sur GitHub Developer Settings

1. Connectez-vous à GitHub et allez dans vos **Settings** > **Developer Settings** > **OAuth Apps**.
2. Cliquez sur **Register a new application**.
3. Remplissez les informations de l'application :
   - **Homepage URL** : L'URL de votre application (ex: `https://mai-officiel.vercel.app` ou `http://localhost:3010`)
   - **Authorization callback URL** :
     `https://mai-officiel.vercel.app/api/auth/callback/github` (ou `http://localhost:3010/api/auth/callback/github` en développement).
4. Cliquez sur **Register application**.
5. Copiez l'**ID client (Client ID)** et générez un nouveau **Secret client (Client Secret)**.

## 🔑 Variables d'Environnement

Ajoutez les clés suivantes dans votre fichier `.env` ou sur votre serveur d'hébergement :

```env
GITHUB_CLIENT_ID=votre_client_id_github
GITHUB_CLIENT_SECRET=votre_secret_client_github
```
