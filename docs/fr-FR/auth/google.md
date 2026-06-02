# Authentification Google SSO

Ce guide explique comment configurer l'authentification unique (SSO) Google pour votre application mAI.

## 🛠 Configuration sur Google Cloud Console

1. Rendez-vous sur la [Google Cloud Console](https://console.cloud.google.com/).
2. Créez un nouveau projet ou sélectionnez-en un existant.
3. Allez dans **API et services** > **Écran de consentement OAuth**. Configurez-le en mode **Externe** et remplissez les détails demandés.
4. Allez dans **Identifiants** > **Créer des identifiants** > **ID client OAuth**.
5. Sélectionnez **Application Web** comme type d'application.
6. Configurez les URIs suivantes :
   - **Origines JavaScript autorisées** : L'URL de votre application (ex: `https://mai-officiel.vercel.app` ou `http://localhost:3010`)
   - **URIs de redirection autorisées** :
     `https://mai-officiel.vercel.app/api/auth/callback/google` (ou `http://localhost:3010/api/auth/callback/google` en développement).
7. Cliquez sur **Créer** pour obtenir votre **ID client** et votre **Code secret client**.

## 🔑 Variables d'Environnement

Ajoutez les clés suivantes dans votre fichier `.env` ou sur votre serveur d'hébergement (ex: Vercel) :

```env
GOOGLE_CLIENT_ID=votre_client_id_google
GOOGLE_CLIENT_SECRET=votre_secret_client_google
```
