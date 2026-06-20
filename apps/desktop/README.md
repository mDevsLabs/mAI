# 🤯 Application de Bureau mAI

mAI Desktop est une application de bureau multiplateforme pour [mAI](https://github.com/mDevsLabs/mAI), construite avec Electron, offrant une expérience de bureau et des fonctionnalités plus natives.

## ✨ Fonctionnalités

- **🌍 Support Multiplateforme** : Supporte les systèmes macOS (Intel/Apple Silicon), Windows et Linux
- **🔄 Mises à jour Automatiques** : Le mécanisme de mise à jour intégré garantit que vous disposez toujours de la dernière version
- **🌐 Support Multilingue** : Support complet d'internationalisation (i18n) pour plus de 18 langues avec chargement différé
- **🎨 Intégration Native** : Intégration profonde avec le système d'exploitation via les menus natifs, les raccourcis et les notifications
- **🔒 Sécurisé & Fiable** : Notarisé pour macOS, stockage chiffré des jetons (tokens), flux d'authentification OAuth sécurisé
- **📦 Plusieurs Canaux de Rilascio** : Versions Stable, Beta et Nightly
- **⚡ Gestion Avancée des Fenêtres** : Architecture multi-fenêtres avec synchronisation du thème
- **🔗 Synchronisation Serveur Distant** : Synchronisation sécurisée des données avec les instances mAI distantes
- **🎯 Outils de Développement** : Panneau de développement intégré et outils complets de débogage

## 🚀 Configuration de Développement

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

# Vérification des types
pnpm type-check

# Exécuter les tests
pnpm test
```

### Configuration de l'Environnement

Copiez `.env.desktop` vers `.env` et configurez selon vos besoins :

```bash
cp .env.desktop .env
```

> [!WARNING]
> Sauvegardez votre fichier `.env` avant d'effectuer des modifications pour éviter de perdre vos configurations.

### Commandes de Build

| Commande | Description |
| --- | --- |
| `pnpm build:main` | Build main/preload (sortie dist uniquement) |
| `pnpm package:mac` | Package pour macOS (Intel + Apple Silicon) |
| `pnpm package:win` | Package pour Windows |
| `pnpm package:linux` | Package pour Linux |
| `pnpm package:local` | Build de packaging local (sans ASAR) |
| `pnpm package:local:reuse` | Build de packaging local réutilisant la dist existante |

### Workflow de Développement

```bash
# 1. Développement
pnpm dev # Démarrer avec le rechargement à chaud (hot reload)

# 2. Qualité du Code
pnpm lint       # Vérification ESLint
pnpm format     # Formatage Prettier
pnpm type-check # Validation TypeScript

# 3. Tests
pnpm test # Exécuter les tests Vitest

# 4. Build & Package
pnpm build:main    # Build de production (dist uniquement)
pnpm package:local # Package de test local
```

## 🎯 Canaux de Rilascio

| Canal | Description | Stabilité | Mises à jour Automatiques |
| --- | --- | --- | --- |
| **Stable** | Versions entièrement testées | 🟢 Haute | ✅ Oui |
| **Beta** | Pré-versions avec de nouvelles fonctionnalités | 🟡 Moyenne | ✅ Oui |
| **Nightly** | Builds quotidiens avec les derniers changements | 🟠 Basse | ✅ Oui |

## 🛠 Stack Technique

### Framework Core

- **Electron** `37.1.0` - Framework de bureau multiplateforme
- **Node.js** `22+` - Runtime backend
- **TypeScript** `5.7+` - Développement typé et sécurisé
- **Vite** `6.2+` - Outils de build

### Architecture & Patterns

- **Injection de Dépendances** - Conteneur IoC avec enregistrement basé sur les décorateurs
- **Architecture Événementielle** - Communication IPC entre les processus
- **Fédération de Modules** - Chargement dynamique des contrôleurs et des services
- **Pattern Observateur** - Gestion d'état et synchronisation UI

---

Copyright © 2026 [mAI][profile-link]. <br />
Ce projet est sous licence [mAI Community License](./LICENSE).
