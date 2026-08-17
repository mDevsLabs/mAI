# Erreurs et Limites (Quotas)

L'API mAI implémente plusieurs mécanismes de sécurité et de limites d'utilisation (Rate Limiting) basés sur votre forfait d'abonnement. 

## Limites par forfait

Votre quota API dicte le nombre de requêtes que vous pouvez effectuer avant que l'API ne refuse temporairement vos appels.

| Forfait | Quota de requêtes |
|---------|-------------------|
| **Free**| 500 requêtes |
| **Plus**| 1 500 requêtes |
| **Pro** | 5 000 requêtes |
| **Max** | Illimité |

*Note: Le nombre de tokens consommés (Input/Output) est également limité par semaine pour les appels aux modèles IA.*

## Codes d'Erreur Communs

Lorsque vous rencontrez une erreur, l'API renvoie un statut HTTP approprié ainsi qu'un corps JSON contenant des détails.

| Statut HTTP | Signification | Solution |
|-------------|---------------|----------|
| **401 Unauthorized** | Votre clé API est manquante ou mal formatée. | Vérifiez votre en-tête `Authorization: Bearer <clé>`. |
| **403 Forbidden** | Clé invalide, révoquée, ou accès restreint. | Générez une nouvelle clé dans votre console. Si vous utilisez le forfait Free, assurez-vous d'appeler des modèles se terminant par `:free`. |
| **404 Not Found** | La ressource n'existe pas. | Vérifiez l'URL ou l'ID de votre ressource (ex: ID de projet). |
| **429 Too Many Requests** | Quota épuisé. | Vous avez dépassé votre limite de requêtes ou de tokens. Upgradez votre forfait ou attendez la réinitialisation. |
| **500 / 503** | Erreur serveur. | Problème temporaire sur nos serveurs. Réessayez plus tard. |

**Exemple d'erreur 429 :**
\`\`\`json
{
  "error": "Quota exceeded for your plan."
}
\`\`\`
