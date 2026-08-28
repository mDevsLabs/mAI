# Présentation des modèles mAI-1 et mAI-1-Light

L'intégration de l'intelligence artificielle au sein des organisations soulève des enjeux cruciaux de gouvernance et de confidentialité des données. Les modèles **mAI-1** et **mAI-1-Light** répondent à ces exigences en s'appuyant sur une architecture strictement locale (*Local-first*).

Cette approche garantit que l'ensemble des données traitées, des requêtes et du code source reste confiné à votre environnement matériel, sans transit vers des serveurs tiers.

Pour couvrir l'ensemble des cas d'usage et s'adapter aux différentes capacités matérielles, cette génération se décline en deux modèles complémentaires, optimisés pour le moteur d'inférence Ollama.

---

![mAI-1](https://upload.fs.fr/YdirFBxLxC.png)

## mAI-1 : Puissance de calcul et raisonnement complexe

Le modèle **mAI-1** constitue la version haute capacité de la gamme. Conçu pour les stations de travail et postes de développement avancés, il s'appuie sur une base Google Gemma 4 12B Unified.

### Points clés :
- **Raisonnement logique structuré** : Analyse approfondie des requêtes, décomposition en étapes logiques et résolution de problématiques techniques complexes.
- **Assistance au développement logiciel** : Génération de code, refactoring d'architecture, analyse d'erreurs, création de scripts et documentation technique.
- **Analyse multimodale** : Prise en charge native des images et schémas techniques pour l'interprétation d'architectures système et de diagrammes.
- **Contexte étendu** : Capacité de rétention jusqu'à 256 000 tokens selon les ressources matérielles allouées, adaptée à l'analyse de dépôts de code complets et de documentations volumineuses.
- **Compatibilité écosystème** : Prise en charge des pipelines de recherche documentaire augmentée (RAG) et de l'appel d'outils externes (*function calling*).

---

![mAI-1-Light](https://upload.fs.fr/8P7ceTZ0wf.png)

## mAI-1-Light : Efficacité et réactivité au quotidien

Optimisé pour les postes de travail standards et les environnements nécessitant une latence minimale, **mAI-1-Light** repose sur une architecture IBM Granite 4.1 3B.

### Points clés :
- **Légèreté et rapidité** : Inférence fluide sur des configurations matérielles sans GPU dédié lourd.
- **Assistance rédactionnelle et synthèse** : Résumé rapide de documents, reformulation de spécifications et structuration d'idées.
- **Support au code ciblé** : Génération de fonctions unitaires, explications de code et assistance au débogage quotidien.
- **Support multilingue étendu** : Prise en charge native de nombreuses langues dont le français, l'anglais, l'espagnol, l'allemand et l'italien.
- **Intégration RAG** : Capacité d'interrogation documentaire légère et d'extraction de données structurées.

---

## Pourquoi intégrer la gamme mAI à vos processus ?

Le principal atout de la gamme réside dans son modèle d'exécution local. Vos actifs stratégiques, bases documentaires et codes sources ne quittent jamais votre infrastructure. Ce dispositif garantit une conformité totale avec les politiques de sécurité internes et les exigences réglementaires.

### Déploiement

Le déploiement s'effectue directement via Ollama. Rendez-vous sur le [guide de téléchargement Ollama](https://ollama.com/download) pour initialiser l'environnement et lancer le modèle adapté à vos besoins.