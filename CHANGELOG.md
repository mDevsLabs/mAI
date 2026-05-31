<a name="readme-top"></a>

# Changelog

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
