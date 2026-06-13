### Version 0.3.0

Détails de la sous-release : Nouvelles interactions de Pets (nouveaux pets, sons par niveaux, personnalisation du volume), retrait du menu Messager, sécurisation du Stockage des données (France) et refonte de l'interface d'exportation, ajout d'effets visuels de feu sur les statistiques de connexion (streak), correctifs de bugs.

<sup>Released on **2026-06-13**</sup>

#### 🚀 Features

- **pets**: Ajout de trois nouveaux pets (`chibi-rilakkuma`, `dudu-bubu`, `jiji`).
- **pets**: L'effet sonore de chaque pet se déclenche désormais lors d'un appui au niveau 100, avec une interface personnalisable pour le volume et l'activation du son.
- **settings**: Suppression de l'onglet Messager pour alléger les paramètres.
- **storage**: Ajout d'une précision sur la sécurisation des données en France, et réorganisation de l'interface pour l'import/export de données.
- **hotkey**: Nouveau bouton permettant de réinitialiser facilement tous les raccourcis claviers.
- **stats**: Effets visuels ajoutés pour récompenser une connexion consécutive supérieure à 30 jours, incluant un nouvel effet de toast animé (flamme) lors de l'accès au site.
- **notifications**: Ajout d'un système de notifications globales sur la page d'accueil avec historique défilant (100 maximum), menu contextuel par notification (lu, supprimer, etc.), épinglage (limité à 5) et distinction par code couleur (info, succès, erreur).
- **notifications**: Implémentation d'un système de tri des notifications via des onglets rapides (Toutes / Succès / Erreurs / Épinglées) pour retrouver facilement vos alertes ciblées.
- **notifications**: Implémentation des notifications **Web Push** ! Une option a été ajoutée dans les paramètres pour vous demander la permission. Une fois acceptée, vous recevrez vos alertes même avec l'onglet fermé.
- **notifications**: Vos notifications deviennent interactives ! Celles qui sont liées à une action spécifique redirigeront désormais automatiquement vers la page ou conversation concernée au simple clic.
- **settings**: Création d'une interface de paramètres dédiée aux notifications permettant d'activer les recommandations/nouveautés, le Web Push, et de personnaliser finement les effets sonores et le volume par type de notification.
- **agent**: Retrait des suggestions "WhatsApp" et "iMessage" de la liste des canaux de messagerie.
- **stats**: Ajout d'une pluie de confettis immersifs plein écran pour célébrer des paliers importants de séries de connexions. Les confettis ont désormais des **thèmes spéciaux** : dorés pour 50 jours, arc-en-ciel géant pour 100 jours !

#### 🐛 Bug Fixes

- **history**: Correction d'un bug affectant le petit champ de texte pour "Renommer" dans l'historique général, qui disparaissait instantanément au clic à cause d'une perte de focus prématurée.
- **global**: Correctifs généraux pour la stabilité.

---

### Version 0.2.0

Détails de la sous-release : Introduction des Pets, suppression des OAuth2 Vercel/Monday/Discord, renommage des packages desktop et mise à jour des versions.

<sup>Released on **2026-06-08**</sup>

#### 🚀 Features

- **pets - ui**: Introduction de la nouvelle fonctionnalité **Pets** dans la section **Paramètres → General**, positionnée au-dessus de la partie Apparence existante, avec la description générale : _« Les pets vous accompagnent dans mAI ! Choisissez en un qui vous correspond ! »_
- **pets - ui**: Affichage de chaque pet avec son image d'exemple placée à côté de son titre et de sa courte description pour une expérience visuelle claire et intuitive.
- **pets - assets**: Chargement automatique de l'ensemble des pets présents dans le répertoire `public/pets` sans configuration manuelle supplémentaire.
- **pets - animations**: Ajout d'animations supplémentaires sur les pets lorsqu'ils sont en mouvement pour les rendre plus vivants et expressifs dans l'interface.
- **auth - SSO**: Suppression des intégrations d'authentification OAuth2 **Vercel**, **Monday** et **Discord** pour alléger le système d'authentification et simplifier l'expérience utilisateur.
- **desktop - branding**: Renommage des packages de bureau générés via GitHub de `lobehub` en `mai` pour uniformiser la distribution avec l'identité de l'application.
- **versioning**: Mise à jour de la version à `0.2.0` dans `package.json` et `apps/desktop/package.json`.
- **changelog**: Ajout d'une description longue et détaillée de toutes les modifications dans `CHANGELOG.md` à la racine du projet.

#### 🐛 Bug Fixes

- **global**: Correction de divers bugs identifiés pour améliorer la stabilité générale, les performances et l'expérience utilisateur globale de l'application.
