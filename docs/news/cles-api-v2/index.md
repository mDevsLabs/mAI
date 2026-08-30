Le format des clés d\'accès à l\'API mAI évolue vers une structure standardisée, sécurisée et automatiquement générée. Ce document présente les spécifications techniques, les mécanismes de protection cryptographique et les quotas d\'utilisation associés.

---

## 1. Structure et format des clés

Toutes les clés émises par la plateforme répondent au format suivant :

```text
mai-[free|plus|pro|max]-XXXXX-XXXXXXXX
```

- **Préfixe** : `mai-`
- **Tier** : `free`, `plus`, `pro` ou `max` (correspondant au forfait de l\'utilisateur)
- **Segment aléatoire** : `XXXXX-XXXXXXXX` (13 caractères alphanumériques)

> [!IMPORTANT]
> La clé complète doit être transmise dans son intégralité dans l\'en-tête HTTP `Authorization`. Toute transmission tronquée entraîne un refus immédiat (`401 Unauthorized`).

---

## 2. Génération automatique et chiffrement

- La clé est générée **automatiquement** par le système au moment de la création dans la console.
- Elle est **exposée en clair une unique fois** à l\'utilisateur, au moment de sa génération.
- **Seul le hachage SHA-256** est conservé dans les bases de données situées dans l\'Union européenne.
- **Aucune copie interne du secret** n\'est conservée, même par le personnel technique.

---

## 3. Quotas d\'utilisation par semaine

| Forfait | Quota hebdomadaire |
|---|---|
| **Free** | 500 requêtes |
| **Plus** | 1 500 requêtes |
| **Pro** | 3 000 requêtes |
| **Max** | 7 500 requêtes |

Le contrôle de débit s\'applique par adresse IP et par compte afin d\'assurer la stabilité de l\'infrastructure.

---

## 4. Utilisation dans les requêtes HTTP

Chaque appel vers un point de terminaison sécurisé doit intégrer l\'en-tête `Authorization` avec le schéma `Bearer` :

```http
Authorization: Bearer mai-free-A1B2C-DEF45678
```

---

## 5. Référence console

Consultez la rubrique **[Gestion des Clés API](/account/keys)** de la console pour générer, révoquer ou consulter l\'état de vos clés.

---

*Document mis à jour conformément aux spécifications de sécurité de l\'API mAI V2. Pour toute question technique, référez-vous à la documentation des points de terminaison.*
