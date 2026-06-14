# Application de Bureau mAI

L'application de bureau mAI est une application multiplateforme pour [mAI](https://github.com/mDevsLabs/mAI), construite avec Electron, offrant une expérience de bureau et des fonctionnalités plus natives.

## ✨ Fonctionnalités

- **🌍 Support multiplateforme** : Supporte les systèmes macOS (Intel/Apple Silicon), Windows et Linux
- **🔄 Mises à jour automatiques** : Le mécanisme de mise à jour intégré garantit que vous disposez toujours de la dernière version
- **🌐 Support multilingue** : Support i18n complet pour plus de 18 langues avec chargement paresseux
- **🎨 Intégration native** : Intégration profonde au système d'exploitation avec menus natifs, raccourcis et notifications
- **🔒 Sécurisé & Fiable** : Notarié pour macOS, stockage de jetons chiffré, flux OAuth sécurisé
- **📦 Multiples canaux de publication** : Versions stables, bêta et nightly
- **⚡ Gestion avancée des fenêtres** : Architecture multi-fenêtres avec synchronisation de thème
- **🔗 Synchronisation serveur distant** : Synchronisation sécurisée des données avec les instances mAI distantes
- **🎯 Outils développeur** : Panneau de développement intégré et outils de débogage complets

## 🚀 Configuration du développement

### Prérequis

- **Node.js** 22+
- **pnpm** 10+
- Environnement de développement compatible **Electron**

### Démarrage rapide

`ash
# Installer les dépendances
pnpm install-isolated

# Démarrer le serveur de développement
pnpm dev

# Vérification des types
pnpm type-check

# Lancer les tests
pnpm test
`

### Configuration de l'environnement

Copiez .env.desktop vers .env et configurez selon vos besoins :

`ash
cp .env.desktop .env
`

> \[!WARNING]
> Sauvegardez votre fichier .env avant d'effectuer des modifications pour éviter de perdre des configurations.

### Commandes de compilation

| Commande                   | Description                                 |
| -------------------------- | ------------------------------------------- |
| pnpm build:main          | Compiler main/preload (sortie dist unique)  |
| pnpm package:mac         | Empaqueter pour macOS (Intel + Apple Silicon) |
| pnpm package:win         | Empaqueter pour Windows                     |
| pnpm package:linux       | Empaqueter pour Linux                       |
| pnpm package:local       | Compilation d'empaquetage local (sans ASAR)|
| pnpm package:local:reuse | Empaquetage local réutilisant le dist existant|

### Flux de développement

`ash
# 1. Développement
pnpm dev # Démarrage avec rechargement à chaud

# 2. Qualité du code
pnpm lint       # Vérification ESLint
pnpm format     # Formatage Prettier
pnpm type-check # Validation TypeScript

# 3. Tests
pnpm test # Lancer les tests Vitest

# 4. Compilation & Empaquetage
pnpm build:main    # Compilation de production (dist unique)
pnpm package:local # Empaquetage pour test local
`

## 🎯 Canaux de publication

| Canal       | Description                      | Stabilité | Mises à jour auto |
| ----------- | -------------------------------- | --------- | ----------------- |
| **Stable**  | Versions rigoureusement testées  | 🟢 Haute  | ✅ Oui            |
| **Beta**    | Pré-version avec nouvelles fonctionnalités | 🟡 Moyenne | ✅ Oui            |
| **Nightly** | Builds quotidiens avec derniers changements | 🟠 Basse | ✅ Oui            |

## 🛠 Pile technologique

### Framework Principal

- **Electron** 37.1.0 - Framework de bureau multiplateforme
- **Node.js** 22+ - Runtime backend
- **TypeScript** 5.7+ - Développement typé sécurisé
- **Vite** 6.2+ - Outil de build

### Architecture & Modèles

- **Injection de Dépendances** - Conteneur IoC avec enregistrement basé sur les décorateurs
- **Architecture Orientée Événements** - Communication IPC entre les processus
- **Fédération de Modules** - Chargement dynamique de contrôleurs et services
- **Modèle Observateur** - Gestion de l'état et synchronisation de l'UI

### Outils de Développement

- **Vitest** - Framework de tests unitaires
- **ESLint** - Linting de code
- **Prettier** - Formatage de code
- **electron-builder** - Empaquetage d'applications
- **electron-updater** - Mécanisme de mise à jour automatique

### Sécurité & Stockage

- **Electron Safe Storage** - Stockage chiffré des jetons
- **OAuth 2.0 + PKCE** - Flux d'authentification sécurisé
- **electron-store** - Configuration persistante
- **Custom Protocol Handler** - Gestion sécurisée des callbacks

## 🏗 Architecture

L'application de bureau utilise une injection de dépendances sophistiquée et une architecture orientée événements :

### 📁 Structure Principale

`
src/main/core/
├── App.ts                    # 🎯 Orchestrateur principal de l'application
├── IoCContainer.ts           # 🔌 Conteneur d'injection de dépendances
├── window/                   # 🪟 Modules de gestion de fenêtres
│   ├── WindowThemeManager.ts     # 🎨 Synchronisation de thème
│   ├── WindowPositionManager.ts  # 📐 Persistance de position
│   ├── WindowErrorHandler.ts     # ⚠️  Limites d'erreur
│   └── WindowConfigBuilder.ts    # ⚙️  Constructeur de configuration
├── browser/                  # 🌐 Modules de gestion de navigateurs
│   ├── Browser.ts               # 🪟 Instances individuelles de fenêtre
│   └── BrowserManager.ts        # 👥 Coordinateur multi-fenêtres
├── ui/                       # 🎨 Modules de système UI
│   ├── Tray.ts                  # 📍 Intégration de la zone de notification
│   ├── TrayManager.ts           # 🔧 Gestion de la zone de notification
│   ├── MenuManager.ts           # 📋 Système de menus natifs
│   └── ShortcutManager.ts       # ⌨️  Raccourcis globaux
└── infrastructure/           # 🔧 Services d'infrastructure
    ├── StoreManager.ts          # 💾 Stockage de configuration
    ├── I18nManager.ts           # 🌍 Internationalisation
    ├── UpdaterManager.ts        # 📦 Système de mise à jour auto
    └── StaticFileServerManager.ts # 🗂️ Service de fichiers locaux
`

### 🔄 Cycle de vie de l'application

La classe App.ts orchestre l'intégralité du cycle de vie de l'application à travers des phases clés :

#### 1. 🚀 Phase d'Initialisation

- **Journalisation des informations système** - Capture les détails de l'OS, CPU, RAM et locale
- **Configuration du Store Manager** - Initialise le stockage persistant de configuration
- **Chargement dynamique des modules** - Auto-découverte des contrôleurs et services via imports glob
- **Enregistrement des événements IPC** - Met en place les canaux de communication inter-processus

#### 2. 🏃 Phase de Démarrage

- **Vérification d'instance unique** - S'assure qu'une seule instance de l'application est en cours
- **Lancement du Serveur IPC** - Démarre le serveur de communication
- **Initialisation des gestionnaires principaux** - Initialisation séquentielle de tous les gestionnaires :
  - 🌍 I18n pour l'internationalisation
  - 📋 Système de menu pour les menus natifs
  - 🗂️ Serveur de fichiers statiques pour les ressources locales
  - ⌨️ Enregistrement des raccourcis globaux
  - 🪟 Gestion des fenêtres du navigateur
  - 📍 Zone de notification (Windows uniquement)
  - 📦 Système de mise à jour automatique

### 🔧 Plongée dans les Composants Principaux

#### 🌐 Système de Gestion du Navigateur

- **Architecture Multi-Fenêtres** - Supporte les fenêtres de discussion, paramètres et outils de développement
- **Gestion de l'État des Fenêtres** - Gère le positionnement, le thème et le cycle de vie
- **Mapping WebContents** - Mapping bidirectionnel entre WebContents et identifiants
- **Diffusion d'Événements** - Distribution centralisée d'événements à toutes ou certaines fenêtres spécifiques

#### 🔌 Injection de Dépendances & Système d'Événements

- **Conteneur IoC** - Conteneur basé sur WeakMap pour les méthodes de contrôleurs décorées
- **Décorateurs IPC Typés** - @IpcMethod relie les méthodes du contrôleur à des canaux sécurisés
- **Mapping Automatique d'Événements** - Événements enregistrés lors du chargement des contrôleurs
- **Service Locator** - Récupération de services et contrôleurs sécurisée par type

##### 🧠 Flux IPC Sécurisé par Type

- **Propagation de Contexte Async** - src/main/utils/ipc/base.ts capture IpcContext avec AsyncLocalStorage, permettant aux contrôleurs d'appeler getIpcContext() n'importe où dans un gestionnaire IPC sans transmettre d'arguments explicitement.
- **Registre des Constructeurs de Service** - src/main/controllers/registry.ts exporte controllerIpcConstructors et DesktopIpcServices, permettant le typage automatique des proxies IPC du moteur de rendu.
- **Aide Proxy Renderer** - src/utils/electron/ipc.ts expose ensureElectronIpc() qui crée paresseusement un proxy au-dessus de window.electronAPI.invoke, donnant au code React/Next.js une surface d'API typée sans exposer les proxies bruts.
- **Paquet de Typages Partagés** - pps/desktop/src/main/exports.d.ts augmente @lobechat/electron-client-ipc pour que chaque paquet puisse consommer DesktopIpcServices sans importer directement le code métier desktop.

#### 🪟 Gestion des Fenêtres

- **Fenêtres Sensibles au Thème** - Adaptation automatique au mode sombre/clair du système
- **Stylisation Spécifique à la Plateforme** - Personnalisation de la barre de titre Windows
- **Persistance de Position** - Sauvegarde et restauration des positions de fenêtres entre sessions
- **Limites d'Erreur** - Gestion centralisée des erreurs pour les opérations de fenêtres

#### 🔧 Services d'Infrastructure

##### 🌍 Gestionnaire I18n

- **Support de plus de 18 langues** avec chargement paresseux et organisation par espace de noms
- **Intégration Système** avec détection de locale d'Electron
- **Actualisation UI Dynamique** lors des changements de langue
- **Gestion des Ressources** avec stratégies de chargement efficaces

##### 📦 Gestionnaire de Mise à Jour

- **Support Multi-Canaux** (stable, beta, nightly) avec intervalles configurables
- **Téléchargements en Arrière-plan** avec suivi de progression et notifications utilisateur
- **Protection contre la Rétrogradation** avec gestion d'erreur et mécanismes de récupération
- **Gestion des Canaux** avec changement de canal automatique

##### 💾 Store Manager

- **Stockage Typé Sécurisé** utilisant electron-store avec interfaces TypeScript
- **Secrets Chiffrés** via l'API Safe Storage d'Electron
- **Validation de Configuration** avec gestion des valeurs par défaut
- **Intégration au Système de Fichiers** avec création automatique de répertoires

##### 🗂️ Serveur de Fichiers Statiques

- **Serveur HTTP Local** pour servir les ressources de l'application et fichiers utilisateurs
- **Contrôles de Sécurité** avec filtrage des requêtes et validation des accès
- **Gestion des Fichiers** avec capacités de téléchargement et suppression
- **Résolution de Chemin** avec routage intelligent entre les emplacements de stockage

#### 🎨 Intégration du Système UI

- **Raccourcis Globaux** - Enregistrement de raccourcis clavier spécifique à la plateforme avec détection de conflits
- **Zone de Notification (Tray)** - Intégration native avec menus contextuels et notifications
- **Menus Natifs** - Menus d'application et contextuels spécifiques à la plateforme avec i18n
- **Synchronisation de Thème** - Mises à jour automatiques du thème à travers tous les composants UI

### 🏛 Architecture Contrôleur & Service

#### 🎮 Modèle Contrôleur

- **Décorateurs IPC Typés** - Les contrôleurs étendent ControllerModule et exposent des méthodes au renderer via @IpcMethod
- **Gestion d'Événements IPC** - Traite les événements du renderer avec un enregistrement basé sur décorateurs
- **Hooks de Cycle de Vie** - eforeAppReady et fterAppReady pour les phases d'initialisation
- **Communication Sécurisée par Type** - Typage fort pour tous les événements et réponses IPC
- **Limites d'Erreur** - Gestion d'erreur exhaustive avec propagation appropriée

#### 🔧 Modèle Service

- **Encapsulation de Logique Métier** - Séparation propre des préoccupations
- **Gestion des Dépendances** - Gérée via le conteneur IoC
- **Partage Inter-Contrôleurs** - Services accessibles via le modèle de localisation de service
- **Gestion des Ressources** - Initialisation et nettoyage appropriés

### 🔗 Communication Inter-Processus

#### 📡 Fonctionnalités du Système IPC

- **Communication Bidirectionnelle** - Main↔Renderer et Main↔serveur Next.js
- **Événements Typés Sécurisés** - Interfaces TypeScript pour tous les paramètres d'événements
- **Sensibilisation au Contexte** - Les événements incluent le contexte de l'expéditeur pour les opérations spécifiques à la fenêtre
- **Propagation d'Erreur** - Gestion centralisée d'erreur avec codes d'état appropriés

##### 🧩 Aide IPC Renderer

Le code du renderer utilise un proxy léger généré à l'exécution pour conserver les appels IPC typés sans exposer d'objets bruts Electron via contextBridge. Utilisez l'aide exportée depuis src/utils/electron/ipc.ts pour accéder aux services du processus principal :

`	s
import { ensureElectronIpc } from '@/utils/electron/ipc';

const ipc = ensureElectronIpc();
await ipc.windows.openSettingsWindow({ tab: 'provider' });
`

#### 🛡️ Fonctionnalités de Sécurité

- **OAuth 2.0 + PKCE** - Authentification sécurisée avec validation du paramètre d'état
- **Stockage Chiffré de Jetons** - Utilisant l'API Safe Storage d'Electron lorsque disponible
- **Gestionnaire de Protocole Personnalisé** - Gestion de callbacks sécurisée pour les flux OAuth
- **Filtrage de Requêtes** - Contrôles de sécurité pour requêtes web et liens externes

## 🧪 Tests

### Structure des Tests

`ash
apps/desktop/src/main/controllers/__tests__/ # Tests unitaires des contrôleurs
tests/                                       # Tests d'intégration
`

### Lancement des Tests

`ash
pnpm test       # Lancer tous les tests
pnpm test:watch # Mode watch
pnpm type-check # Validation de type
`

### Couverture des Tests

- **Tests des Contrôleurs** - Validation de la gestion d'événements IPC
- **Tests des Services** - Vérification de la logique métier
- **Tests d'Intégration** - Test de flux de travail de bout en bout
- **Tests de Type** - Validation des interfaces TypeScript

## 🔒 Fonctionnalités de Sécurité

### Authentification & Autorisation

- **Flux OAuth 2.0** avec PKCE pour un échange de jeton sécurisé
- **Validation du Paramètre d'État** pour prévenir les attaques CSRF
- **Stockage Chiffré de Jetons** en utilisant le stockage sécurisé natif de la plateforme
- **Rafraîchissement Automatique de Jetons** avec repli sur la ré-authentification

### Sécurité de l'Application

- **Signature de Code** - Notarisation macOS pour une sécurité accrue
- **Sandboxing** - Accès contrôlé aux ressources système
- **Contrôles CSP** - Gestion de Content Security Policy
- **Filtrage de Requêtes** - Contrôles de sécurité pour les requêtes externes

### Protection des Données

- **Configuration Chiffrée** - Données sensibles chiffrées au repos
- **IPC Sécurisé** - Canaux de communication typés et sécurisés
- **Validation des Chemins** - Contrôles d'accès sécurisés au système de fichiers
- **Sécurité Réseau** - Application stricte du HTTPS et support proxy

## 🤝 Contribution

Le développement d'applications de bureau implique des considérations multiplateformes complexes et des intégrations natives. Nous accueillons les contributions de la communauté pour améliorer les fonctionnalités, la performance et l'expérience utilisateur.

### Processus de Contribution

1. Forkez le dépôt [mAI](https://github.com/mDevsLabs/mAI)
2. Configurez l'environnement de développement de bureau en suivant notre guide
3. Apportez vos modifications à l'application de bureau
4. Soumettez une Pull Request décrivant :
- Les résultats des tests de compatibilité plateforme
- L'analyse de l'impact sur les performances
- Les considérations de sécurité
- Les améliorations de l'expérience utilisateur
- Les changements majeurs (s'il y en a)

## 📚 Ressources Supplémentaires

- **Guide de Développement** : [Development.md](./Development.md) - Documentation complète de développement
- **Documents d'Architecture** : [/docs](../../docs/) - Spécifications techniques détaillées
- **Contribution** : [CONTRIBUTING.md](../../CONTRIBUTING.md) - Directives de contribution
- **Problèmes & Support** : [GitHub Issues](https://github.com/mDevsLabs/mAI/issues)

