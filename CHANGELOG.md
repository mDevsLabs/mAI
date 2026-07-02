## [Version 1.0.0](https://github.com/mDevsLabs/mAI/compare/v0.9.0...v1.0.0)

<sup>Released on **2026-06-28**</sup>

#### 🏆 Rewards & Gamification
- **Quêtes** : Création de 700 quêtes quotidiennes à difficulté allégée (10-30 MP) et 700 quêtes hebdomadaires standards (100-150 MP) entièrement rédigées en français sans aucun numéro générique.
- **Badges** : Création de 100 badges uniques associés à 100 emojis différents, classés par rareté (50 Rare, 30 Épique, 10 Légendaire, 7 Mythique, 3 Ultra) avec tags colorés d'Ant Design.
- **Niveau** : Courbe de progression réajustée pour demander exactement 200 MP par niveau.
- **Bonus** : Limitation à 3 quêtes quotidiennes bonus par jour maximum avec message d'erreur d'Ant Design en cas de dépassement.
- **FAQ & Paramètres** : Intégration d'une FAQ en Markdown de 10 guides, contours de l'accordéon polis, suppression des emojis superflus dans les titres, et réorganisation de l'onglet Paramètres en 4ème position dans le menu déroulant.

#### 🦊 Virtual Companions (Pets)
- **Orientation des pattes** : Correction du bug d'orientation des jambes/pattes du compagnon lors de son déplacement vers la droite (la jambe va maintenant dans le sens naturel de la marche).

#### 🌍 Localization (i18n)
- **Langues** : Traduction intégrale et manuelle de toutes les clés de gamification (`gamification.*`), de compagnons (`settingPets.*`), et de navigation (`tab.rewards*`, `tab.pets`) dans les 18 langues de l'application.

#### ⚡ Performance & UI
- **Performances** : Mémoïsation du composant `BadgeCard` pour un chargement instantané et une recherche fluide sans aucun lag de rendu.
- **Colonnes de badges** : Correction du bug d'affichage en colonnes multiples (interpolation de la variable `${columns}`).
- **Page Niveau** : Effets de fondu de page (`fadeIn`), pulsation lumineuse (`pulseGlow`) sur le cercle, et survol interactif sur les cartes de statistiques.