# Démarrage Rapide ⚡

Ce guide vous accompagne pour installer et lancer **mAI** localement sur votre machine de développement.

## Prérequis

Assurez-vous d'avoir installé les outils suivants :
- **Node.js** (v18 ou supérieure recommandée)
- **pnpm** ou **bun** pour la gestion des packages et de l'espace de travail

## Installation

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/mDevsLabs/mAI.git
   cd mAI
   ```

2. **Installer les dépendances** :
   Avec pnpm :
   ```bash
   pnpm install
   ```
   Avec bun :
   ```bash
   bun install
   ```

3. **Lancer le serveur de développement** :
   ```bash
   pnpm dev
   # ou
   bun run dev
   ```

L'application sera accessible dans votre navigateur à l'adresse `http://localhost:3010`. Lors du premier lancement, vous serez accueilli par l'assistante **May** pour configurer vos préférences initiales !
