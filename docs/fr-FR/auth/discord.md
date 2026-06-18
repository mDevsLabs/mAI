# Authentification Discord SSO

Ce guide explique comment configurer l'authentification unique (SSO) Discord pour votre application mAI.

## 🛠 Configuration sur Discord Developer Portal

1. Rendez-vous sur le [Discord Developer Portal](https://discord.com/developers/applications).
2. Cliquez sur **New Application** et donnez-lui un nom.
3. Allez dans l'onglet **OAuth2** dans le menu de gauche.
4. Dans la section **Redirects**, cliquez sur **Add Redirect** et ajoutez l'URI suivante :
   `https://mai-officiel.vercel.app/api/auth/callback/discord` (ou `http://localhost:3010/api/auth/callback/discord` en développement).
5. Sauvegardez les modifications.
6. Copiez le **Client ID** et le **Client Secret** visibles dans la section **Client Information**.

## 🔑 Variables d'Environnement

Ajoutez les clés suivantes dans votre fichier `.env` ou sur votre serveur d'hébergement :

```env
DISCORD_CLIENT_ID=votre_client_id_discord
DISCORD_CLIENT_SECRET=votre_secret_client_discord
```
