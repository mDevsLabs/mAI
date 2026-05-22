# Modèles de langage supportés 🧠

**mAI** est une interface agnostique vis-à-vis des modèles de langage. Elle supporte une large variété de fournisseurs d'intelligence artificielle commerciaux et locaux.

## Fournisseurs Cloud majeurs

Vous pouvez configurer les fournisseurs cloud suivants en renseignant votre clé API personnelle :
- **OpenAI** : GPT-4o, GPT-4 Turbo, GPT-3.5, etc.
- **Anthropic** : Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku.
- **Google Gemini** : Gemini 1.5 Pro, Gemini 1.5 Flash.
- **Mistral AI** : Mistral Large, Mistral Medium, Codestral.
- **Groq** : Accès ultra-rapide à des modèles open source comme Llama 3 et Mixtral.

## Intégration de modèles locaux

Pour les utilisateurs soucieux de la confidentialité totale de leurs données, mAI prend en charge l'exécution locale :
- **Ollama** : Intégration native simplifiée. Lancez Ollama en arrière-plan et mAI détectera automatiquement vos modèles installés localement (comme Llama 3, Mistral, ou Phi-3).
- **APIs compatibles OpenAI** : Connectez n'importe quel serveur d'inférence local ou distant (comme LocalAI ou LM Studio) en spécifiant une adresse d'API personnalisée.
