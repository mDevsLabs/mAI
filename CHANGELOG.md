<a name="readme-top"></a>

# Changelog

### Version 0.1.6

Sub-release details: OAuth multi-provider expansion, brand rename to mAI / May, and Telegram login support.

<sup>Released on **2026-06-04**</sup>

#### 🚀 Features
- **auth - SSO**: Ajout des fournisseurs de connexion Google, GitHub, Discord, Slack, Spotify, Twitch, Notion, X, Canva et Telegram, avec routage OAuth aligné sur `/api/auth/callback/[provider]`.
- **auth - env**: Extension des variables serveur `AUTH_*` pour couvrir les nouveaux clients OAuth et validation centralisée via `src/envs/auth.ts`.
- **auth - ui**: Affichage des logos PNG locaux dans les boutons de connexion et le panneau des comptes liés, avec le nouveau branding mAI / May et l'avatar `may.PNG`.
- **auth - branding**: Remplacement des références visibles LobeHub et Lobe AI dans les surfaces d'authentification, les e-mails et les métadonnées produit.
- **auth - sécurité**: Revue ciblée des callbacks OAuth, des alias de provider, et de la propagation des secrets serveur pour éviter toute fuite côté client.

### Version 0.1.4

Sub-release details: Better-Auth SSO env handling and canary workflow cleanup.

<sup>Released on **2026-05-31**</sup>

#### 🚀 Features
- **auth - SSO**: Lecture directe des variables d'environnement Vercel via `process.env.PROVIDER_CLIENT_ID` et `process.env.PROVIDER_CLIENT_SECRET` pour Google, GitHub, Discord, Twitch et Spotify, sans préfixe `AUTH_`.
- **auth - validation**: Correction des faux positifs de détection des variables SSO dans Better-Auth pour empêcher les avertissements de configuration alors que les secrets sont bien présents.
- **workflows**: Suppression de l'étape `lint` du build canary desktop pour alléger le pipeline GitHub Actions.

### Version 0.1.3

Sub-release details: Integrated Twitch, Spotify, Google, GitHub, and Discord SSO features.

<sup>Released on **2026-05-31**</sup>

#### 🚀 Features
- **auth - SSO**: Restriction complète de l'authentification SSO tierce de Better-Auth à seulement 5 fournisseurs officiels : Google, GitHub, Discord, Twitch, et Spotify. Suppression de l'ensemble des configurations des fournisseurs d'authentification tierce obsolètes (Apple, Auth0, Authelia, Authentik, Casdoor, Cloudflare Zero Trust, Cognito, Feishu, Generic OIDC, Keycloak, Logto, Microsoft, Okta, WeChat, Zitadel).
- **auth - env**: Intégration et validation stricte via Zod (dans `src/envs/auth.ts`) des secrets et IDs client sans préfixe `AUTH_` pour les variables : `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`, `DISCORD_CLIENT_ID/SECRET`, `TWITCH_CLIENT_ID/SECRET`, et `SPOTIFY_CLIENT_ID/SECRET`.
- **auth - ui**: Modification de la gestion visuelle dans `AuthIcons.tsx` pour afficher les logos PNG locaux haute résolution (`google-logo.png`, `github-logo.png`, `discord-logo.png`, `twitch-logo.png`, `spotify-logo.png`) à la place des icônes SVG par défaut sur les interfaces de connexion et le panneau de profil.
- **auth - paramètres**: Démasquage et réactivation complète de la section "Comptes connectés" dans les paramètres généraux de profil utilisateur, permettant de lier et délier à la volée ses comptes sociaux.
- **auth - redirection**: Configuration et validation des callbacks officiels de production (`https://mai-officiel.vercel.app/api/auth/callback/[provider]`).
- **cooker**: Bouton d'exportation PDF / Impression de recettes 🖨️ avec mise en page stylisée spécialement optimisée pour être affichée en cuisine.
- **locales**: Centralisation et enrichissement complet des traductions de Quizzly, Cooker et de la page Extensions dans un namespace dédié `extensions` (traductions fr-FR et en-US incluses manuellement).
- **eslint**: Résolution de l'avertissement de dépendances manquantes dans le hook `useEffect` du module Quizzly (`syncWithServer`).
- **desktop**: Renommage complet de `lobehub` / `LobeHub` en `mai` / `mAI` dans l'application desktop et les fichiers de builds / workflows CI-CD pour uniformiser la distribution.
- **cooker**: Connexion de la génération de recettes Cooker au service LLM (`chatService`) de l'utilisateur.
- **cooker**: Gestion dynamique et sur-mesure de l'exclusion des allergènes choisis et cochés librement par l'utilisateur.
- **cooker**: Synchronisation cloud et stockage PostgreSQL de l'historique complet des recettes générées.
- **cooker - nutrition**: Calcul et extraction fine des macro-nutriments (kcal, protéines, glucides, lipides) dans l'objet recette grâce à un prompt et un schéma JSON IA dédiés si l'option nutritionnelle est cochée.
- **cooker - courses**: Génération d'une liste de courses structurée à partir des ingrédients, exportable et téléchargeable au format JSON (.json) et texte brut (.txt).
- **cooker - partage**: Intégration d'un bouton de partage public unique créant à la volée un topic virtuel connecté à `topic_shares` pour que des invités puissent consulter la recette directement sur le web.

### Version 0.1.2

<sup>Released on **2026-05-31**</sup>

#### 🚀 Features
- **tests E2E**: Intégration complète de scénarios de tests d'interface utilisateur (Playwright + Cucumber) sur la route `/extensions` pour valider l'ouverture et la fermeture interactives du panneau draggable.
- **tests unitaires**: Écriture de tests unitaires sous `vitest` et `@testing-library/react` pour le composant de chargement `BrandTextLoading` afin de valider son comportement réactif selon les configurations de marque.
- **branding**: Remplacement des imports de l'icône LobeHub provenant de la dépendance `@lobehub/icons` par l'icône locale haute résolution `/icons/icon-512x512.png` dans `ModelSelect` et `ProviderIconWrapper`.
- **branding**: Remplacement du logo de chargement par défaut (LobeHub) par une interface premium animée avec pulsation CSS, arborant l'icône locale `512x512` de mAI et le nom de marque textuel.
- **optimisation**: Préchargement de l'icône haute résolution `/icons/icon-512x512.png` via une balise `<link rel="preload">` dans le `<head>` de `layout.tsx` pour éliminer tout scintillement visuel lors du chargement initial de l'application.
- **animations d'interaction**: Intégration de micro-animations CSS fluides (`fadeInSlideUp` et `scaleFadeIn`) sur le panneau d'extensions et sur son bouton de réouverture dynamique pour un ressenti utilisateur soigné.
- **workflows**: Retrait de la compilation macOS-15-intel obsolète dans les workflows de build GitHub Actions pour accélérer et stabiliser la distribution.
- **navigation**: Intégration de la page Extensions dans la barre latérale de navigation principale pour une expérience fluide d'accès aux mServices.

### Version 0.1.1

<sup>Released on **2026-05-31**</sup>

#### 🚀 Features
- **onboarding**: Ajout de l'étape de configuration d'un fournisseur d'IA dans l'accueil avec saisie des clés API et des adresses de proxy (endpoints personnalisés) pour OpenAI, Google et Anthropic.
- **onboarding**: Intégration d'un bouton de validation et de test de connexion réseau en direct via le service de chat (`chatService.fetchPresetTaskResult`) pour s'assurer du bon fonctionnement des clés.
- **onboarding**: Ajout d'une détection et d'une analyse fine des codes d'erreurs d'API ou de proxy lors des tests (SSL, URL mal formées, accès interdit 403, non trouvé 404, timeouts, non autorisé 401) afin d'afficher des conseils de diagnostic ciblés pour l'utilisateur.
- **onboarding**: Optimisation du chargement des modèles grâce à une synchronisation automatique en arrière-plan (`fetchRemoteModelList`) lors d'un test de connexion ou d'une configuration réussie pour actualiser les capacités et la liste des modèles à jour.
- **onboarding**: Correction de l'importation de `TraceNameMap` provenant de `@lobechat/types` pour garantir la stabilité et la compilation du code.
- **models**: Intégration native des modèles phares **Qwen 3.7 Max** et **Gemini 3.5 Flash** dans la base de données des modèles de model-bank.
- **models**: Modification du modèle général par défaut pour utiliser **GPT-5.5** d'OpenAI.
- **workflows**: Correction du fichier d'action GitHub `release-desktop-canary.yml` en supprimant le blocage systématique si aucun tag de release stable n'est présent, avec mise en place d'un repli dynamique basé sur la version lue dans le `package.json`.
- **branding**: Résolution du bug d'icône d'application montrant l'ancien logo Lobe AI en corrigeant le chemin d'accès absolu `/icons/icon-512x512.png` et en forçant le composant `ProductLogo` à utiliser uniquement `CustomLogo`.
- **seo**: Amélioration du référencement de la page d'accueil en nettoyant la variable dynamique de traduction `appName` dans les métadonnées pour insérer le nom de marque statique **mAI**.
- **documentation**: Suppression de tous les anciens répertoires `changelog` présents dans les sous-dossiers de langues de `docs/` afin d'éviter tout doublon.

### Version 0.1.0

<sup>Released on **2026-05-30**</sup>

#### 🚀 Features
- **branding**: Remplacement complet de l'avatar par défaut de l'assistant par `/avatars/may.PNG`.
- **branding**: Remplacement global de toutes les occurrences de LobeHub par mAI et Lobe AI par May dans les fichiers de locales de l'application (root et desktop).
- **onboarding**: Amélioration de l'onboarding pour utiliser l'agent May au lieu de Lobe AI et redirection de ses chemins.
- **rules**: Ajout de directives de développement spécifiques pour les agents sous `.agents/rules.md`.
- **cleaning**: Suppression du dossier obsolète `changelog` de la racine du projet.

### Version 0.0.8

<sup>Released on **2026-05-30**</sup>

#### 🚀 Features
- **docs**: Mise à jour de l'image principale du README vers `@public/avatars/may.PNG` et traduction en français.
- **docs**: Ajout des versions `en-US`, `es-ES` et `de-DE` du README.
- **docs**: Traduction de `CONTRIBUTING.md` en français.
- **extension**: Création de la première extension Quizzly, un jeu vidéo d'apprentissage connecté aux modèles d'IA, avec les interfaces Jouer, Profil, et Boutique, développée avec `@lobehub/ui`.
- **extension**: Quizzly v2 avec de vrais appels IA (OpenAI), une Boutique, des Ligues, animations Framer Motion, et effets sonores.


### Version 0.0.7

<sup>Released on **2026-05-30**</sup>

#### 🚀 Features
- **feature**: Ajout du panneau latéral des extensions `ExtensionsSidebarPanel` sous la gestion de `useExtensionStore`.
- **branding**: Application globale du nouveau branding `mAI` et `May` dans les fichiers de locales JSON.
- **mcp**: Retrait complet des providers MCP par défaut comme X (Twitter) et YouTube de l'affichage.
- **docs**: Suppression récursive de tous les fichiers de documentation en langue chinoise (`zh-CN`).
- **changelog**: Création des changelogs de la version `0.0.6` en français et anglais.

### Version 0.0.4

<sup>Released on **2026-05-29**</sup>

#### 🚀 Features
- **branding**: Renommage de l'affichage global "LobeHub" en "mAI".
- **branding**: Renommage de l'affichage de l'assistant "LobeAI" en "May".
- **branding**: Remplacement de l'avatar par défaut `/avatars/may.PNG` par `/avatars/may.PNG`.
- **docs**: Nettoyage et restructuration complète du changelog.
