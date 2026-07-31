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
Renvoie la liste des modèles spécifiques à mAI, tels que `mai-1.5-apex`, `mai-1.5-opal`, `mai-1.5-light`, ainsi que les séries mAI-1.2 et mAI-1.

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
      "id": "mai-1.5-apex",
      "name": "mAI 1.5 Apex",
      "description": "Le modèle mAI haut de gamme Flagship avec vision, thinking et tools.",
      "context_length": 262144
    },
    {
      "id": "mai-1.5-opal",
      "name": "mAI 1.5 Opal",
      "description": "Modèle 27B ultra-équilibré pour l'intelligence élevée et la vélocité.",
      "context_length": 262144
    },
    {
      "id": "mai-1.5-light",
      "name": "mAI 1.5 Light",
      "description": "Modèle 4B ultra-rapide et multimodal pour les machines personnelles.",
      "context_length": 262144
    }
  ]
}
\`\`\`
