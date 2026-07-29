# API des Modèles

Les endpoints des modèles vous permettent de lister les modèles disponibles avec votre compte et de récupérer leurs métadonnées. L'accès aux modèles dépend de votre forfait. Le forfait *Free* donne uniquement accès aux modèles se terminant par `:free`.

## Lister tous les modèles IA
Renvoie la liste des modèles IA standards compatibles (fournis via l'intégration).

**Endpoint**
\`\`\`http
GET /v1/models
\`\`\`

**Exemple de réponse**
\`\`\`json
{
  "object": "list",
  "data": [
    {
      "id": "meta-llama/llama-3-8b-instruct:free",
      "name": "Llama 3 8B (Free)",
      "description": "Modèle libre d'accès pour les forfaits gratuits.",
      "context_length": 8192
    },
    {
      "id": "anthropic/claude-3-opus",
      "name": "Claude 3 Opus",
      "description": "Le modèle le plus performant d'Anthropic.",
      "context_length": 200000
    }
  ]
}
\`\`\`

## Lister les modèles mAI exclusifs
Renvoie la liste des modèles spécifiques à mAI, tels que `mai-1.2-apex`, `mai-1.2-opal`, et `mai-1-light`.

**Endpoint**
\`\`\`http
GET /v1/mai/models
\`\`\`

**Exemple de réponse**
\`\`\`json
{
  "object": "list",
  "data": [
    {
      "id": "mai-1.2-apex",
      "name": "mAI 1.2 Apex",
      "description": "Le modèle mAI le plus avancé pour la logique complexe.",
      "context_length": 128000
    },
    {
      "id": "mai-1.2-opal",
      "name": "mAI 1.2 Opal",
      "description": "Modèle équilibré pour les tâches quotidiennes rapides.",
      "context_length": 64000
    }
  ]
}
\`\`\`
