# 🤯 Application de Bureau mAI
mAI Desktop est une application de bureau multiplateforme pour [mAI](https://github.com/mDevsLabs/mAI), construite avec Electron, offrant une expérience et des fonctionnalités de bureau plus natives.

## ✨ Fonctionnalités

- **🌍 Support Multiplateforme** : Compatible avec les systèmes macOS (Intel/Apple Silicon), Windows et Linux.
- **🔄 Mises à jour Automatiques** : Le mécanisme de mise à jour intégré garantit que vous disposez toujours de la dernière version.
- **🌐 Support Multilingue** : Support complet de l'i18n pour plus de 18 langues avec chargement différé.
- **🎨 Intégration Native** : Intégration approfondie avec le système d'exploitation via les menus natifs, les raccourcis clavier et les notifications.
- **🔒 Sécurisé & Fiable** : Signé et notarisé pour macOS, stockage chiffré des clés, flux OAuth sécurisé.
- **📦 Multiples Canaux de Distribution** : Versions stable, bêta et nightly builds.
- **⚡ Gestion Avancée des Fenêtres** : Architecture multi-fenêtres avec synchronisation automatique du thème.
- **🔗 Synchronisation Serveur Distant** : Synchronisation sécurisée des données avec des instances mAI distantes.
- **🎯 Outils de Développement** : Panneau de développement intégré et outils complets de débogage.

## 🚀 Configuration pour le Développement

### Prérequis

- **Node.js** 22+
- **pnpm** 10+
- Environnement de développement compatible **Electron**

### Démarrage Rapide

```bash
# Installer les dépendances
pnpm install-isolated

# Lancer le serveur de développement
pnpm dev

# Vérification du typage
pnpm type-check

# Exécuter les tests
pnpm test
```

### Configuration de l'Environnement

Copiez le fichier `.env.desktop` vers `.env` et configurez-le selon vos besoins :

```bash
cp .env.desktop .env
```

> [!WARNING]
> Sauvegardez votre fichier `.env` avant d'effectuer des modifications pour éviter de perdre vos configurations.

### Commandes de Build

| Commande                   | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| `pnpm build:main`          | Compiler le processus principal et preload (dist uniquement)|
| `pnpm package:mac`         | Empaqueter pour macOS (Intel + Apple Silicon)               |
| `pnpm package:win`         | Empaqueter pour Windows                                     |
| `pnpm package:linux`       | Empaqueter pour Linux                                       |
| `pnpm package:local`       | Build d'empaquetage local (sans ASAR)                       |
| `pnpm package:local:reuse` | Build d'empaquetage local en réutilisant le dist existant   |

### Flux de Travail de Développement

```bash
# 1. Développement
pnpm dev # Lancer avec rechargement à chaud (hot reload)

# 2. Qualité du Code
pnpm lint       # Vérification ESLint
pnpm format     # Formatage Prettier
pnpm type-check # Validation TypeScript

# 3. Tests
pnpm test # Exécuter les tests Vitest

# 4. Build & Empaquetage
pnpm build:main    # Build de production (dist uniquement)
pnpm package:local # Empaquetage pour test local
```

## 🎯 Canaux de Distribution

| Canal       | Description                                       | Stabilité | Mises à jour auto |
| ----------- | ------------------------------------------------- | --------- | ----------------- |
| **Stable**  | Versions entièrement testées                      | 🟢 Haute  | ✅ Oui            |
| **Beta**    | Pré-versions avec nouvelles fonctionnalités       | 🟡 Moyenne| ✅ Oui            |
| **Nightly** | Builds quotidiens avec les derniers changements   | 🟠 Basse  | ✅ Oui            |

## 🛠 Stack Technique

### Framework Principal

- **Electron** `37.1.0` - Framework de bureau multiplateforme
- **Node.js** `22+` - Runtime backend
- **TypeScript** `5.7+` - Développement typé et sécurisé
- **Vite** `6.2+` - Outil de build

### Architecture & Modèles

- **Injection de Dépendances** - Conteneur IoC avec enregistrement basé sur des décorateurs
- **Architecture Dirigée par les Événements** - Communication IPC entre les processus
- **Fédération de Modules** - Chargement dynamique des contrôleurs et services
- **Modèle Observateur** - Gestion de l'état et synchronisation de l'interface utilisateur

### Outils de Développement

- **Vitest** - Framework de tests unitaires
- **ESLint** - Validation de code
- **Prettier** - Formatage de code
- **electron-builder** - Empaquetage de l'application
- **electron-updater** - Mécanisme de mise à jour automatique

### Sécurité & Stockage

- **Electron Safe Storage** - Stockage chiffré des clés et tokens
- **OAuth 2.0 + PKCE** - Flux d'authentification sécurisé
- **electron-store** - Configuration persistante
- **Gestionnaire de Protocole Personnalisé** - Gestion sécurisée des rappels (callbacks)

## 🏗 Architecture

L'application de bureau utilise une architecture sophistiquée d'injection de dépendances et de communication dirigée par les événements :

### 📁 Structure Principale

```
src/main/core/
├── App.ts                    # 🎯 Orchestrateur principal de l'application
├── IoCContainer.ts           # 🔌 Conteneur d'injection de dépendances
├── window/                   # 🪟 Modules de gestion des fenêtres
│   ├── WindowThemeManager.ts     # 🎨 Synchronisation des thèmes
│   ├── WindowPositionManager.ts  # 📐 Persistance de la position
│   ├── WindowErrorHandler.ts     # ⚠️  Gestion des erreurs
│   └── WindowConfigBuilder.ts    # ⚙️  Générateur de configuration
├── browser/                  # 🌐 Modules de gestion du navigateur
│   ├── Browser.ts               # 🪟 Instances de fenêtres individuelles
│   └── BrowserManager.ts        # 👥 Coordinateur multi-fenêtres
├── ui/                       # 🎨 Modules du système d'interface utilisateur
│   ├── Tray.ts                  # 📍 Intégration de la zone de notification
│   ├── TrayManager.ts           # 🔧 Gestion du tray
│   ├── MenuManager.ts           # 📋 Système de menu natif
│   └── ShortcutManager.ts       # ⌨️  Raccourcis globaux
└── infrastructure/           # 🔧 Services d'infrastructure
    ├── StoreManager.ts          # 💾 Stockage de la configuration
    ├── I18nManager.ts           # 🌍 Internationalisation
    ├── UpdaterManager.ts        # 📦 Système de mise à jour automatique
    └── StaticFileServerManager.ts # 🗂️ Serveur de fichiers locaux
```

### 🔄 Cycle de Vie de l'Application

La classe `App.ts` orchestre tout le cycle de vie de l'application à travers plusieurs phases clés :

#### 1. 🚀 Phase d'Initialisation

- **Journalisation des informations système** - Capture les détails de l'OS, du processeur, de la RAM et de la langue.
- **Configuration du Store Manager** - Initialise le stockage persistant de la configuration.
- **Chargement dynamique des modules** - Découvre automatiquement les contrôleurs et les services via des imports glob.
- **Enregistrement des événements IPC** - Configure les canaux de communication inter-processus.

#### 2. 🏃 Phase de Bootstrap

- **Vérification d'instance unique** - S'assure qu'une seule instance de l'application est en cours d'exécution.
- **Lancement du serveur IPC** - Démarre le serveur de communication.
- **Initialisation des gestionnaires principaux** - Initialisation séquentielle de tous les gestionnaires :
  - 🌍 I18n pour l'internationalisation
  - 📋 Système de menu pour les menus natifs
  - 🗂️ Serveur de fichiers statiques pour les ressources locales
  - ⌨️ Raccourcis clavier globaux
  - 🪟 Gestion des fenêtres du navigateur
  - 📍 Zone de notification (tray) (Windows uniquement)
  - 📦 Système d'auto-mise à jour

### 🔧 Analyse Approfondie des Composants

#### 🌐 Système de Gestion du Navigateur

- **Architecture multi-fenêtres** - Supporte les fenêtres de chat, de paramètres et d'outils de développement.
- **Gestion de l'état des fenêtres** - Gère le positionnement, le thème et le cycle de vie.
- **Mapping WebContents** - Mapping bidirectionnel entre les WebContents et leurs identifiants.
- **Diffusion d'événements** - Distribution centralisée des événements à toutes les fenêtres ou à des fenêtres spécifiques.

#### 🔌 Injection de Dépendances & Système d'Événements

- **Conteneur IoC** - Conteneur basé sur WeakMap pour les méthodes de contrôleur décorées.
- **Décorateurs IPC Typés** - `@IpcMethod` relie les méthodes des contrôleurs à des canaux typés et sécurisés.
- **Mapping automatique des événements** - Événements enregistrés lors du chargement des contrôleurs.
- **Localisateur de Services** - Récupération typée des services et des contrôleurs.

##### 🧠 Flux IPC Sécurisé

- **Propagation de contexte asynchrone** - `src/main/utils/ipc/base.ts` capture l'`IpcContext` avec `AsyncLocalStorage`, permettant ainsi à la logique du contrôleur d'appeler `getIpcContext()` n'importe où dans un gestionnaire IPC sans transmettre explicitement les arguments.
- **Registre des constructeurs de services** - `src/main/controllers/registry.ts` exporte `controllerIpcConstructors` et `DesktopIpcServices`, permettant le typage automatique des proxies IPC du renderer.
- **Proxy du Renderer** - `src/utils/electron/ipc.ts` expose `ensureElectronIpc()` qui construit un proxy dynamiquement au-dessus de `window.electronAPI.invoke`, fournissant une interface typée au code React/Next.js sans exposer les proxies bruts dans le preload.
- **Package de types partagés** - `apps/desktop/src/main/exports.d.ts` enrichit `@lobechat/electron-client-ipc` pour que chaque package puisse utiliser `DesktopIpcServices` sans importer directement le code métier desktop.

#### 🪟 Gestion des Fenêtres

- **Fenêtres adaptées au thème** - Adaptation automatique au mode sombre/clair du système.
- **Style spécifique à la plateforme** - Personnalisation de la barre de titre et de la superposition sous Windows.
- **Persistance de la position** - Enregistre et restaure les positions des fenêtres d'une session à l'autre.
- **Gestion des erreurs** - Gestion centralisée des erreurs pour les opérations de fenêtres.

#### 🔧 Services d'Infrastructure

##### 🌍 I18n Manager

- Support de plus de 18 langues avec chargement différé et organisation par espaces de noms.
- Intégration système avec la détection de langue d'Electron.
- Rafraîchissement dynamique de l'interface utilisateur lors des changements de langue.

##### 📦 Update Manager

- Support multi-canaux (stable, beta, nightly) avec intervalles configurables.
- Téléchargements en arrière-plan avec suivi de progression et notifications.
- Protection contre les retours en arrière (rollback) avec gestion des erreurs et récupération.

##### 💾 Store Manager

- Stockage typé et sécurisé utilisant `electron-store` avec interfaces TypeScript.
- Secrets chiffrés via l'API Safe Storage d'Electron.
- Validation de la configuration avec gestion des valeurs par défaut.

##### 🗂️ Serveur de Fichiers Statiques

- Serveur HTTP local pour distribuer les ressources de l'application et les fichiers utilisateur.
- Contrôles de sécurité avec filtrage des requêtes et validation des accès.
- Routage intelligent entre les différents emplacements de stockage.

#### 🎨 Intégration de l'Interface Utilisateur

- **Raccourcis globaux** - Enregistrement de raccourcis clavier natifs avec détection des conflits.
- **Zone de notification (Tray)** - Intégration native avec menus contextuels et notifications.
- **Menus natifs** - Menus d'application et menus contextuels spécifiques à la plateforme avec support i18n.

## 🧪 Tests

### Structure des Tests

```bash
apps/desktop/src/main/controllers/__tests__/ # Tests unitaires des contrôleurs
tests/                                       # Tests d'intégration
```

### Exécution des Tests

```bash
pnpm test       # Exécuter tous les tests
pnpm test:watch # Mode observateur
pnpm type-check # Validation des types
```

## 🔒 Sécurité

### Authentification & Autorisation

- **Flux OAuth 2.0** avec PKCE pour un échange de tokens sécurisé.
- **Validation du paramètre d'état (State)** pour empêcher les attaques CSRF.
- **Stockage chiffré des tokens** en utilisant le stockage sécurisé natif de la plateforme.

### Sécurité de l'Application

- **Signature du Code** - Notarisation macOS pour une sécurité renforcée.
- **Sandbox** - Accès contrôlé aux ressources système.
- **Contrôles CSP** - Gestion de la politique de sécurité du contenu (Content Security Policy).

## 🤝 Contribution

Le développement d'applications de bureau implique des considérations multiplateformes complexes et des intégrations natives. Nous accueillons les contributions de la communauté pour améliorer les fonctionnalités, les performances et l'expérience utilisateur de mAI.

### Processus de Contribution

1. Forkez le [dépôt mAI](https://github.com/mDevsLabs/mAI)
2. Configurez l'environnement de développement de bureau en suivant notre guide
3. Apportez vos modifications à l'application de bureau
4. Soumettez une Pull Request décrivant vos changements.

## 📚 Ressources Supplémentaires

- **Guide de Développement** : [`Development.md`](./Development.md) - Documentation complète de développement
- **Docs d'Architecture** : `/docs` - Spécifications techniques détaillées
- **Contribution** : `CONTRIBUTING.md` - Directives de contribution
- **Support & Issues** : [GitHub Issues](https://github.com/mDevsLabs/mAI/issues)
