# Déploiement officiel : La série mAI-1.2 intègre la vision multimodale en local

L'écosystème mAI franchit une étape importante avec le déploiement de la série **mAI-1.2**. Cette itération introduit la prise en charge de la **multimodalité**.

Les modèles traitent désormais les données textuelles ainsi que l'analyse d'images, de captures d'écran et de graphiques techniques, tout en conservant une exécution strictement locale via Ollama afin d'assurer l'étanchéité des données traitées.

La gamme mAI-1.2 se décline en trois niveaux de performance : **Light**, **Apex** et **Opal**.

---

## mAI-1.2-Light : Agilité et rapidité d'exécution

![mAI-1.2-Light](https://upload.fs.fr/YFFKJ4rkMB.png)

Le modèle **Light** constitue la configuration compacte de la gamme, adaptée aux postes de travail individuels et aux cas d'usage nécessitant une faible latence.

**Cas d'usage recommandés :**
* Génération de réponses synthétiques et reformulation de texte.
* Extraction de texte depuis des captures d'écran (OCR structuré).
* Assistance au débogage sur des scripts légers.
* Exécution continue en arrière-plan avec une charge système modérée.

**Benchmarks mAI-1.2-Light :**
![Benchmarks mAI-1.2-Light](https://upload.fs.fr/0hN2V7LWC6.png)

---

## mAI-1.2-Apex : Polyvalence et puissance d'analyse

![mAI-1.2-Apex](https://upload.fs.fr/Aa6fP7VE4N.png)

Positionné au cœur de la gamme, **Apex** est conçu pour les développeurs et équipes techniques nécessitant une capacité d'analyse approfondie.

**Cas d'usage recommandés :**
* Ingénierie logicielle avancée (génération de code complexe, refactoring, explication d'architecture).
* Analyse détaillée de schémas techniques et d'interfaces utilisateur par vision.
* Synthèse de documents volumineux et extraction de données structurées (fichiers de log, formats JSON).
* Intégration dans des pipelines de recherche documentaire RAG de taille intermédiaire.

**Benchmarks mAI-1.2-Apex :**
![Benchmarks mAI-1.2-Apex](https://upload.fs.fr/BZvHvbDIlB.png)

---

## mAI-1.2-Opal : Modèle de référence haute capacité

![mAI-1.2-Opal](https://upload.fs.fr/rTj6zjQ4hI.png)

Modèle le plus capacitaire de la série 1.2, **Opal** est calibré pour les tâches critiques nécessitant une précision élevée et un raisonnement complexe.

**Cas d'usage recommandés :**
* **Maîtrise du code source** : Refactoring d'architectures complètes et analyse approfondie de code TypeScript / Python.
* **Vision experte** : Compréhension sémantique d'images techniques, de visualisations de données et de diagrammes d'infrastructure.
* **Pipelines RAG étendus** : Croisement d'informations au sein de bases documentaires denses.
* **Raisonnement logique structuré** : Décomposition et résolution de problèmes en plusieurs étapes.

**Benchmarks mAI-1.2-Opal :**
![Benchmarks mAI-1.2-Opal](https://upload.fs.fr/AZhQIaqV5O.png)

---

## Déploiement de la gamme mAI-1.2

L'ensemble des modèles mAI-1.2 est optimisé pour une exécution locale via le moteur **Ollama**.

Pour configurer votre environnement, téléchargez Ollama via le portail officiel :
```bash
https://ollama.com/download
```

Une fois le moteur initialisé, vous pouvez charger le modèle adapté à votre infrastructure (Light, Apex ou Opal).

*mDevsLabs – Des solutions d'intelligence artificielle locales et professionnelles.*
