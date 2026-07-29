# Authentification

Pour utiliser l'API mProjects, vous devez vous authentifier à l'aide d'une clé API sécurisée. Cette clé permet à la fois d'identifier votre compte et de déduire votre consommation de votre forfait (Free, Plus, Pro, Max).

## Obtenir une clé API
1. Connectez-vous à votre compte sur l'interface mProjects.
2. Allez dans la section **API**.
3. Créez une nouvelle clé API en lui donnant un nom et, optionnellement, une description ou des restrictions de domaine.
4. Votre clé générée ressemblera à : `mp-abcdefghij-12345`.

## Utiliser la clé API
Chaque requête envoyée à l'API doit inclure votre clé dans l'en-tête HTTP `Authorization`, précédée du mot `Bearer`.

**Exemple d'en-tête HTTP :**
\`\`\`http
Authorization: Bearer mp-abcdefghij-12345
\`\`\`

**Exemple en cURL :**
\`\`\`bash
curl -X GET "https://mprojects.val.run/v1/models" \\
  -H "Authorization: Bearer VOTRE_CLE_API"
\`\`\`

> [!WARNING]
> Gardez votre clé API secrète. Ne la publiez jamais dans des dépôts de code publics (comme GitHub) et ne l'intégrez pas directement dans le code source de vos applications frontend (côté client). Utilisez toujours un backend pour effectuer vos requêtes si possible.
