# Chat Completions

L'endpoint de chat completions permet de générer du texte ou d'avoir des conversations interactives avec les modèles d'intelligence artificielle. Cet endpoint est 100% compatible avec l'API OpenAI.

## Générer une réponse

**Endpoint**
\`\`\`http
POST /v1/chat/completions
\`\`\`

**Corps de la requête (JSON)**
\`\`\`json
{
  "model": "meta-llama/llama-3-8b-instruct:free",
  "messages": [
    {
      "role": "system",
      "content": "Tu es un assistant utile."
    },
    {
      "role": "user",
      "content": "Bonjour ! Peux-tu me résumer l'histoire d'internet en deux phrases ?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 150
}
\`\`\`

### Propriétés principales

- **`model`** *(obligatoire)* : L'ID du modèle à utiliser. Les utilisateurs avec le forfait *Free* doivent obligatoirement utiliser un modèle avec le suffixe `:free`.
- **`messages`** *(obligatoire)* : Un tableau des messages composant la conversation. Chaque objet doit contenir :
  - `role` : L'auteur du message (`system`, `user`, ou `assistant`).
  - `content` : Le texte du message.
- **`temperature`** *(optionnel)* : Nombre entre 0 et 2 contrôlant le niveau de créativité (défaut : 1).
- **`max_tokens`** *(optionnel)* : Le nombre maximum de tokens que le modèle peut générer dans sa réponse.

**Exemple de réponse**
\`\`\`json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "meta-llama/llama-3-8b-instruct:free",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Bien sûr ! Internet est né dans les années 1960 en tant que projet militaire américain (ARPANET) visant à créer un réseau de communication décentralisé. Il s'est ensuite développé et démocratisé dans les années 1990 grâce à l'invention du World Wide Web, devenant le réseau mondial interconnecté que nous utilisons aujourd'hui."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 30,
    "completion_tokens": 62,
    "total_tokens": 92
  }
}
\`\`\`
