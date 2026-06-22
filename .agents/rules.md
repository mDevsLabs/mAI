# Règles pour les Agents de Codage 📝🚀

Ce document définit les règles et directives que chaque agent de codage intervenant sur ce dépôt doit obligatoirement respecter.

## 1. Gestion des Versions & Changelogs 📈
- **`e2e/package.json` et `CHANGELOG.md`** : À la fin de vos modifications, vous devez *suggérer* à l'utilisateur s'il souhaite incrémenter la version dans `e2e/package.json` et mettre à jour le `CHANGELOG.md`. Ne le faites pas obligatoirement de vous-même.
- **Documentation (`docs/`)** : Si l'utilisateur accepte, créez un nouveau fichier de notes de version au format MD dans les répertoires `docs/en-US/changelog/` et `docs/fr-FR/changelog/` (par exemple : `010-30-05-2026.md` pour la version `0.1.0`).

## 2. Style de Communication 💬🇫🇷
- **Langue** : Les agents doivent obligatoirement communiquer et s'adresser à l'utilisateur en français.
- **Emojis** : Agrémentez vos explications et réponses de quelques emojis appropriés pour rendre l'échange convivial et clair.
- **Synthèse** : Expliquez clairement les modifications apportées à la fin de chaque mise à jour et recommandez les étapes suivantes ou modifications futures.

## 3. Interface & Modifications Visuelles 🎨✨
- **Inspiration** : Pour toute modification visuelle ou fonctionnelle sur l'application, inspirez-vous de l'identité visuelle existante et premium (comme l'avatar de l'agent May, les transitions dynamiques, l'esthétique soignée).
- **Technologie Stack** : Respectez l'architecture de style CSS-in-JS propre à LobeHub (notamment `antd-style` avec `createStaticStyles` et `cssVar.*`) et utilisez les composants de `@lobehub/ui`.

## 4. Tests et Vérifications 🧪
- **Vérifications de types** : Ne lancez pas de vérifications globales comme `bun run type-check`. Limitez-vous à exécuter des tests uniquement sur les fichiers complexes qui viennent d'être modifiés.

## 5. Suivi et Améliorations Futures 🚀
- À la fin de chaque mise à jour ou intervention, analysez les modifications et proposez à l'utilisateur d'autres changements futurs pertinents pour améliorer la base de code ou l'expérience utilisateur.
