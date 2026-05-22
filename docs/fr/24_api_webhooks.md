# API et Webhooks 🔗

**mAI** fournit des interfaces programmatiques pour permettre des intégrations externes avec vos propres applications, services web ou scripts d'automatisation.

## API Locale (HTTP)

L'application de bureau mAI peut exposer un serveur web local sécurisé fonctionnant sur un port défini. Ce serveur propose plusieurs points de terminaison (endpoints) :
- `POST /api/chat` : Permet d'envoyer un message à un agent spécifique et de recevoir une réponse structurée en temps réel ou sous forme de flux (streaming).
- `GET /api/agents` : Liste tous les agents disponibles et leurs configurations.
- `POST /api/agents` : Permet de créer programmatiquement un nouvel agent.

## Utilisation des Webhooks

Vous pouvez configurer des webhooks sortants dans les paramètres avancés de mAI. Un webhook permet d'envoyer automatiquement une charge utile JSON (payload) vers une URL externe à chaque fois qu'un événement survient :
- **Fin de message** : Déclenché dès qu'un agent a fini de répondre à une discussion.
- **Nouvel agent créé** : Déclenché lorsqu'un nouvel agent est ajouté au système.
- **Erreur système** : Déclenché en cas d'erreur de clé API ou d'indisponibilité du fournisseur LLM.
