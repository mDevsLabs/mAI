### Version 0.2.0

Détails de la sous-release : Introduction des Pets, suppression des OAuth2 Vercel/Monday/Discord, renommage des packages desktop et mise à jour des versions.

<sup>Released on **2026-06-08**</sup>

#### 🚀 Features
- **pets - ui**: Introduction de la nouvelle fonctionnalité **Pets** dans la section **Paramètres → General**, positionnée au-dessus de la partie Apparence existante, avec la description générale : *« Les pets vous accompagnent dans mAI ! Choisissez en un qui vous correspond ! »*
- **pets - ui**: Affichage de chaque pet avec son image d'exemple placée à côté de son titre et de sa courte description pour une expérience visuelle claire et intuitive.
- **pets - assets**: Chargement automatique de l'ensemble des pets présents dans le répertoire `public/pets` sans configuration manuelle supplémentaire.
- **pets - animations**: Ajout d'animations supplémentaires sur les pets lorsqu'ils sont en mouvement pour les rendre plus vivants et expressifs dans l'interface.
- **auth - SSO**: Suppression des intégrations d'authentification OAuth2 **Vercel**, **Monday** et **Discord** pour alléger le système d'authentification et simplifier l'expérience utilisateur.
- **desktop - branding**: Renommage des packages de bureau générés via GitHub de `lobehub` en `mai` pour uniformiser la distribution avec l'identité de l'application.
- **versioning**: Mise à jour de la version à `0.2.0` dans `package.json` et `apps/desktop/package.json`.
- **changelog**: Ajout d'une description longue et détaillée de toutes les modifications dans `CHANGELOG.md` à la racine du projet.

#### 🐛 Bug Fixes
- **global**: Correction de divers bugs identifiés pour améliorer la stabilité générale, les performances et l'expérience utilisateur globale de l'application.