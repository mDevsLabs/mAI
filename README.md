# 🚀 mAI (mDevsLabs)

Bienvenue sur le portail officiel de **mAI** par **mDevsLabs**. Ce projet est une application web moderne développée avec **Next.js 16** qui centralise nos outils d'intelligence artificielle, notre documentation technique, notre API unifiée et nos modèles LLM.

---

## 🌟 La Suite mAI

La suite **mAI** regroupe 5 piliers complémentaires :

1. 🌐 **Web** *(Alpha)* : Application d'IA en ligne web directement et simplement pour discuter avec l'IA mAI.
2. ⚡ **Pulse** *(Bêta)* : Ensemble d'extensions pour diverses applications pour discuter avec mAI directement (navigateur, VS Code...).
3. 💻 **CLI** *(Bêta)* : Discussions et séances de codage dans le terminal CLI via mAI.
4. 📄 **Office** *(Bêta)* : Création de documents et présentations avec mAI.
5. ☁️ **Cloud** *(Réflexion)* : Stockage cloud de documents et intégration d'mAI pour des résumés.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling** : [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS
- **Animations** : [Motion](https://motion.dev/)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Backend API & Val Town** : [https://mai.val.run](https://mai.val.run)

---

## 💻 Démarrage Local

### Prérequis

Assurez-vous d'avoir installé **Node.js** (version 20 ou supérieure conseillée) sur votre machine.

### Instructions

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/mDevsLabs/mAI.git
   cd mai
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

---

## 🌐 API Unifiée

Le backend Val Town est accessible sur :
```
https://mai.val.run/v1/
```
Endpoints principaux :
- `GET /v1/models` : Catalogue des modèles LLM disponibles
- `POST /v1/chat/completions` : Requêtes de chat compatibles OpenAI
- `GET /v1/projects` : Liste des projets de la suite mAI
- `GET /v1/projects/:id` : Détails d'un projet spécifique
