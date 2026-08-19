# Bienvenue sur l'API mAI

L'API REST mAI vous permet d'accéder programmatiquement aux modèles mAI (série 1.0, 1.2, 1.5, Light, Apex, Opal) ainsi qu'au catalogue des projets de la suite mAI (Web, Pulse, CLI, Office).

## URL de Base
Toutes les requêtes vers l'API s'effectuent sur l'URL de base suivante :
```text
https://mai.val.run/v1
```

## Format de Données
- L'API accepte uniquement du **JSON** dans le corps des requêtes HTTP (méthodes POST). Assurez-vous de configurer l'en-tête `Content-Type: application/json`.
- Toutes les réponses sont retournées au format **JSON**.

## Compatibilité OpenAI
Nos points de terminaisons pour l'intelligence artificielle (notamment `/v1/chat/completions`) sont intentionnellement conçus pour être compatibles avec le format de l'API d'OpenAI. Cela signifie que vous pouvez facilement utiliser les bibliothèques client OpenAI officielles (Python, Node.js) en remplaçant l'URL de base et la clé API.

## Étapes Suivantes
1. Lisez la section sur l'[Authentification](./2-authentification.md) pour obtenir votre clé API.
2. Explorez les [Modèles](./3-models-api.md) disponibles.
3. Créez votre première requête de [Chat Completion](./4-chat-completions.md).
