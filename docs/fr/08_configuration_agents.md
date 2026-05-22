# Configuration des agents ⚙️

La personnalisation fine des agents dans **mAI** permet de modifier en profondeur leur comportement, leur style de réponse et les outils auxquels ils ont accès.

## Paramètres de base

Pour chaque agent, vous pouvez configurer :
- **Prompt Système** : Les instructions fondamentales définissant la personnalité, les règles et le rôle de l'agent. C'est le paramètre le plus influent sur les réponses de l'agent.
- **Modèle de Langage** : Sélectionnez le LLM par défaut à utiliser (par exemple, GPT-4o, Claude 3.5 Sonnet, Llama 3).

## Paramètres avancés

Vous pouvez également modifier les hyperparamètres de génération :
- **Température** : Contrôle la créativité des réponses. Une température basse (ex: 0.2) produit des réponses plus factuelles et déterministes. Une température élevée (ex: 0.9) favorise la créativité.
- **Top P** : Une autre méthode de contrôle de la diversité des réponses.
- **Pénalité de présence / fréquence** : Encourage ou décourage l'agent de répéter les mêmes mots ou de s'éloigner des sujets abordés.
- **Nombre maximum de jetons (Max Tokens)** : Limite la longueur maximale de la réponse générée.
