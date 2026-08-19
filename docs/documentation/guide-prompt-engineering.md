---
title: "Prompts"
description: "Meilleures pratiques de rédaction de prompts et d'utilisation de formats structurés (JSON/XML)."
category: "Guides"
order: 5
---

# Prompt Engineering & Structuration de Contextes ✍️⚡

Ce guide résume les meilleures pratiques pour tirer le meilleur parti des modèles **mAI** grâce à des techniques modernes dePrompt Engineering.

---

## 🎯 Principes Fondamentaux

1. **Rôle & Contexte Système Explicit** : Définissez toujours un rôle clair dans le champ system message.
2. **Exemples Few-Shot** : Fournissez 2 ou 3 exemples d'entrées et de sorties attendues.
3. **Balisage XML pour Contextes Multiples** : Utilisez des balises `<document>`, `<instructions>`, `<constraints>` pour séparer les éléments du prompt.
4. **Format de Sortie Contraint (JSON Schema)** : Forcez le modèle à répondre avec un schéma JSON strict pour les intégrations logicielles.

---

## 📄 Exemple de Prompt Optimisé

```markdown
<system>
Tu es un expert en audit de code TypeScript pour la plateforme mAI.
</system>

<instructions>
Analyse le code ci-dessous et renvoie un rapport au format JSON contenant :
- "score": nombre de 0 à 10
- "vulnerabilities": liste des failles de sécurité
- "recommendations": liste des améliorations
</instructions>

<code_to_audit>
export function parseInput(raw: any) {
  return eval(raw);
}
</code_to_audit>
```

---

## ❌ Mauvaise Pratique vs ✅ Bonne Pratique

- ❌ *Mauvais* : "Refais ce code en mieux."
- ✅ *Bon* : "Refactorise la fonction `parseInput` en supprimant l'usage de `eval()` et en sécurisant le typage TypeScript avec un schéma Zod."

---

## 📐 Structure des Prompts

### Format XML pour Complexité Élevée

```xml
<conversation>
  <system>
    Tu es un assistant expert en IA générative spécialisé dans le développement web.
    Réponds toujours en français, avec des exemples de code quand pertinent.
  </system>
  
  <user>
    J'ai besoin d'une API REST pour gérer des utilisateurs avec FastAPI.
    Peux-tu me fournir le code complet ?
  </user>
  
  <requirements>
    - Utiliser SQLAlchemy avec SQLite
    - Endpoint POST /users pour créer
    - Endpoint GET /users/{id} pour récupérer
    - Validation des données avec Pydantic
    - Documentation automatique Swagger
  </requirements>
  
  <output_format>
    Fournis le code en bloc markdown avec les imports, modèles et endpoints.
  </output_format>
</conversation>
```

### Format Markdown avec Balises

```markdown
## Contexte
Tu es un expert en machine learning opérationnel.

## Tâche
Optimise ce pipeline d'entraînement pour réduire le temps d'entraînement de 30%.

## Contraintes
- Ne pas dépasser 16 Go de VRAM
- Maintenir une précision > 95%
- Utiliser du mixed precision

## Code Source
```python
# Votre code ici
```

## Format de Sortie
1. Problèmes identifiés
2. Solutions proposées
3. Code optimisé
```

---

## 🧠 Techniques Avancées

### 1. Chain of Thought (Raisonnement Étape par Étape)

```markdown
Tu es un expert en algorithmes. Résous ce problème en détaillant chaque étape :

Problème : Trouve le plus grand commun diviseur de 48 et 18.

Raisonnement :
1. Je dois identifier les diviseurs...
2. ...
Solution : GCD(48, 18) = 6
```

### 2. Self-Consistency

```markdown
Résous ce problème de mathématiques de 3 différentes manières, puis donne la solution la plus fréquente :

Problème : Combien y a-t-il de façons de choisir 3 livres parmi 10 ?

Méthode 1 : Combinaisons
Méthode 2 : Règle de croissance
Méthode 3 : Vérification par comptage direct
```

### 3. Role-Playing

```markdown
Tu es un professeur de physique chaude. Explique la mécanique quantique comme si j'avais 15 ans.

Utilise des analogies simples et évite le jargon technique excessif.
```

---

## 📊 Formats de Sortie Structurés

### JSON Schema Strict

```json
{
  "type": "object",
  "properties": {
    "summary": {"type": "string"},
    "keywords": {"type": "array", "items": {"type": "string"}},
    "sentiment": {"enum": ["positive", "negative", "neutral"]},
    "confidence": {"type": "number", "minimum": 0, "maximum": 1}
  },
  "required": ["summary", "keywords", "sentiment", "confidence"]
}
```

### Prompt avec Schéma JSON

```markdown
Analyse ce texte et réponds UNIQUEMENT avec ce JSON exact :

{
  "title": "...",
  "main_points": ["...", "..."],
  "action_items": ["...", "..."],
  "deadline": "YYYY-MM-DD"
}

Texte à analyser : [VOTRE_TEXTE_ICI]
```

---

## ⚡ Optimisation des Prompts

### Astuce 1: Constraints Explicites

```markdown
❌ "Résume ce document."
✅ "Résume ce document en 3 phrases maximum, en conservant les 5 points clés."
```

### Astuce 2: Exemples Contrôlés

```markdown
Exemple 1 (positif) :
Input: "Je suis très heureux aujourd'hui"
Output: {"sentiment": "positive", "score": 0.95}

Exemple 2 (négatif) :
Input: "Je suis très déçu de ce résultat"
Output: {"sentiment": "negative", "score": 0.92}

Maintenant, analyse ceci : "[NOUVEAU_TEXTE]"
```

### Astuce 3: Temperature Contrôlée

| Cas d'Usage | Température |
|-------------|-------------|
| Code/Technical | 0.1-0.3 |
| Créatif/Rédaction | 0.7-0.9 |
| Décision/Logique | 0.2-0.4 |
| Brainstorming | 0.8-1.0 |

---

## 🛠️ Outils de Prompt Management

### Bibliothèque de Prompts

```python
PROMPT_TEMPLATES = {
    "code_review": """
    Tu es un expert en code review. Analyse ce code {language} :
    
    <code>
    {code}
    </code>
    
    Retourne un JSON avec :
    - issues: liste des problèmes
    - severity: critique/moyen/minor
    - fix: suggestion de correction
    """,
    
    "financial_analysis": """
    Analyse ce rapport financier :
    
    {report}
    
    Fournis :
    1. Résumé exécutif
    2. Points clés
    3. Alertes/Risques
    """
}
```

---

## 📚 Ressources

- **Fine-Tuning** : [Guide d'adaptation](/docs?doc=guide-fine-tuning)
- **Sécurité** : [Guide Privacy](/docs?doc=guide-security-privacy)
- **API** : [Documentation](/docs?doc=api-rest-endpoints)
