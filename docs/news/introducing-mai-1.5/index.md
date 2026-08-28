# Déploiement officiel de la série de modèles mAI-1.5

*Publié le 28 août 2026 par l'équipe mDevsLabs*

Nous annonçons le déploiement officiel de notre nouvelle génération de modèles d'intelligence artificielle locale : la **série mAI-1.5**.

Issue d'un travail approfondi d'optimisation architecturale, la génération 1.5 réunit de manière unifiée trois fonctionnalités fondamentales : la **vision multimodale**, le **raisonnement analytique structuré (mode Thinking)** et l'**exécution dynamique d'outils (Function Calling / Tools)**.

Conformément aux principes de conception de mDevsLabs, l'ensemble de la gamme s'exécute de manière **100 % locale et souveraine** via Ollama ou Hugging Face, assurant une isolation complète des données et du code source sans dépendance externe.

---

## Gamme de modèles mAI-1.5

La série mAI-1.5 se compose de trois modèles distincts, dimensionnés pour répondre à différents profils d'infrastructure et d'exigences opérationnelles :

---

### mAI-1.5-Light (4B) – Agilité et réactivité

![mAI-1.5-Light](https://upload.fs.fr/0J1yh8hnbE.png)

Le modèle **mAI-1.5-Light** constitue la solution légère et rapide de la gamme. Avec 4 milliards de paramètres, il intègre l'ensemble des capacités fonctionnelles de la série : traitement visuel, logique de raisonnement et appel de scripts.

- **Spécifications** : 4 milliards de paramètres | Contexte de 256K tokens | Vision, Mode Thinking et Appel d'outils.
- **Exigences matérielles** : Optimisé pour postes individuels et ordinateurs portables (4 Go à 8 Go de VRAM).
- **Documentation** : [Consulter la fiche mAI-1.5-Light](/models/mai-1.5-light).

#### Commandes d'installation

**Via Ollama :**
```bash
ollama run mDevsLabs/mAI-1.5-Light
```

**Via Hugging Face CLI :**
```bash
hf download mDevsLabs/mAI-1.5-Light
```

---

### mAI-1.5-Apex (9B) – Modèle d'ingénierie et de performance

![mAI-1.5-Apex](https://upload.fs.fr/sfMTiFkLRL.png)

Modèle central de la série, **mAI-1.5-Apex** offre un équilibre optimal entre capacité de raisonnement et efficacité d'inférence. Avec ses 9 milliards de paramètres, il convient particulièrement aux tâches de développement logiciel, d'analyse technique et d'ingénierie.

- **Spécifications** : 9 milliards de paramètres | Contexte de 256K tokens | Vision haute précision, Thinking avancé et Tools.
- **Exigences matérielles** : Recommandé pour stations de travail dotées d'un GPU dédié (8 Go à 16 Go de VRAM).
- **Documentation** : [Consulter la fiche mAI-1.5-Apex](/models/mai-1.5-apex).

#### Commandes d'installation

**Via Ollama :**
```bash
ollama run mDevsLabs/mAI-1.5-Apex
```

**Via Hugging Face CLI :**
```bash
hf download mDevsLabs/mAI-1.5-Apex
```

---

### mAI-1.5-Opal (27B) – Intelligence supérieure et grands contextes

![mAI-1.5-Opal](https://upload.fs.fr/XrRoXSQq0B.png)

**mAI-1.5-Opal** représente la référence haute performance de mDevsLabs. Doté de 27 milliards de paramètres, il excelle dans la synthèse documentaire sur contextes étendus, l'analyse logique complexe et l'orchestration d'agents autonomes.

- **Spécifications** : 27 milliards de paramètres | Contexte de 256K tokens | Vision multimodale, Thinking structuré et Function Calling.
- **Exigences matérielles** : Conçu pour serveurs locaux et postes de calcul dédiés (16 Go à 24 Go de VRAM).
- **Documentation** : [Consulter la fiche mAI-1.5-Opal](/models/mai-1.5-opal).

#### Commandes d'installation

**Via Ollama :**
```bash
ollama run mDevsLabs/mAI-1.5-Opal
```

**Via Hugging Face CLI :**
```bash
hf download mDevsLabs/mAI-1.5-Opal
```

---

## Innovations techniques majeures

1. **Architecture unifiée Thinking, Tools et Vision** : Prise en charge séquentielle de l'analyse d'image, de la planification par étapes et de l'appel d'API dans un flux de traitement unique.
2. **Fenêtre de contexte de 256 000 tokens** : Ingestion et analyse de dépôts de code complets et de documentations denses sans rupture d'attention.
3. **Formats GGUF et quantification optimisée** : Déploiement immédiat avec une empreinte mémoire maîtrisée sur Ollama et Hugging Face.

---

## Ressources et téléchargements

Les caractéristiques techniques détaillées, benchmarks et guides d'intégration de la série mAI-1.5 sont disponibles dans la section [Modèles](/models) de la plateforme.

*mDevsLabs – Intelligence artificielle haute performance, locale et souveraine.*
