# Authentification API

Pour utiliser l'API mAI, vous devez vous authentifier à l'aide d'une clé API sécurisée. Cette clé permet à la fois d'identifier votre compte et de déduire votre consommation de votre forfait (Free, Plus, Pro, Max).

## Obtenir une clé API
1. Connectez-vous à votre compte sur l'interface mAI.
2. Rendez-vous dans la section **Clés API**.
3. Cliquez sur **Créer une clé API**.
4. Copiez votre clé secrète générée (ex: `mai_live_...`) et conservez-la précieusement.

## Utilisation dans vos requêtes
Chaque requête envoyée à l'API doit inclure votre clé dans l'en-tête HTTP `Authorization` avec le schéma `Bearer` :

```http
Authorization: Bearer mai_live_votre_cle_secrete
```

### Exemple avec cURL
```bash
curl -X GET "https://mai.val.run/v1/models" \
  -H "Authorization: Bearer mai_live_votre_cle_secrete"
```

> [!WARNING]
> Gardez votre clé API secrète. Ne la publiez jamais dans des dépôts de code publics (comme GitHub) et ne l'intégrez pas directement dans le code source de vos applications frontend (côté client). Utilisez toujours un backend pour effectuer vos requêtes si possible.
