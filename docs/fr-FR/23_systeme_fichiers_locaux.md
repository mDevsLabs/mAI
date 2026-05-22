# Système de fichiers locaux 📂

L'application de bureau **mAI** offre une intégration poussée avec le système de fichiers de votre système d'exploitation, facilitant l'accès et l'analyse de vos fichiers locaux en toute sécurité.

## Lecture et analyse de fichiers

Vous pouvez soumettre directement des fichiers à vos agents (par exemple, **May**) pour qu'ils les analysent ou les modifient :
- **Glisser-déposer (Drag and Drop)** : Faites glisser un document texte, un fichier PDF, une feuille de calcul Excel, ou une image directement dans la zone de discussion de mAI.
- **Pièce jointe** : Cliquez sur le bouton trombone dans le chat pour parcourir votre explorateur de fichiers.
- Les fichiers sont lus et traités localement, et seul le contenu textuel extrait (ou l'image elle-même pour les modèles multimodaux) est envoyé au LLM pour traitement.

## Sécurité et restrictions

Afin de préserver la sécurité de vos données :
- mAI ne lit jamais vos fichiers système sans votre action explicite (glisser-déposer ou sélection manuelle).
- Vous pouvez définir dans les paramètres généraux un répertoire spécifique auquel mAI a le droit d'accéder, limitant l'accès au reste du disque dur.
