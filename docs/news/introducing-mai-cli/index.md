# mAI CLI : L'assistant de développement intégré au terminal

> **mDevsLabs** annonce l'ouverture en **accès anticipé** de **mAI CLI**, un outil d'assistance au développement conçu pour s'intégrer directement au terminal. Gratuit, modulaire et compatible avec les modèles de votre choix.

---

## Sommaire

1. [Le terminal au centre du flux de développement](#le-terminal-au-centre-du-flux-de-développement)
2. [Capacités et fonctionnalités](#capacités-et-fonctionnalités)
3. [Communication intégrée](#communication-intégrée)
4. [Modèle BYOK (Bring Your Own Key)](#modèle-byok-bring-your-own-key)
5. [Guide d'installation](#guide-dinstallation)
6. [Public cible](#public-cible)
7. [Accès anticipé et contributions](#accès-anticipé-et-contributions)
8. [Conclusion](#conclusion)

---

## Le terminal au centre du flux de développement

Le terminal demeure le point d'ancrage central des opérations d'ingénierie logicielle. C'est dans cet environnement que s'exécutent la compilation, les tests automatisés, le déploiement et l'analyse des journaux d'erreurs.

La plupart des assistants d'intelligence artificielle imposent pourtant des ruptures de contexte répétées en nécessitant le basculement vers des interfaces graphiques ou des fenêtres de navigateur distinctes.

**mAI CLI adopte une approche directe :** l'assistant s'exécute au sein même de votre session de travail active. Une commande unique, `mai`, permet d'interagir immédiatement avec l'outil sans interruption de flux.

Le projet est accessible publiquement en **accès anticipé**. Le dépôt est ouvert et l'installation s'effectue en quelques instants.

---

## Capacités et fonctionnalités

mAI CLI est un agent d'exécution conçu pour agir avec précision sur votre environnement local dans un cadre strictement défini par l'utilisateur.

### Revue de code et Pull Requests

L'analyse des modifications introduites par une branche ou une *pull request* constitue une étape clé du cycle de développement. mAI CLI permet d'inspecter les diffs, d'en synthétiser les évolutions majeures et de mettre en évidence les points d'attention critiques directement dans la console.

Cette restitution facilite la première passe de relecture technique avant la validation humaine définitive.

### Traitement des anomalies et gestion des tickets

mAI CLI structure le traitement des anomalies techniques :
- Consultation des tickets ouverts ;
- Synthèse des contextes d'erreurs ;
- Mise en relation avec les modules de code concernés ;
- Propositions d'actions correctives.

### Interaction avec le système de fichiers

mAI CLI dispose de fonctionnalités de lecture et de modification ciblée de fichiers. L'assistant peut parcourir l'arborescence du projet pour contextualiser une implémentation et proposer des ajustements précis.

### Exécution de commandes et vérifications

L'outil peut exécuter des commandes de build, lancer des suites de tests et interpréter les codes de retour pour valider la résolution d'une anomalie dans une boucle de rétroaction continue.

---

## Communication intégrée

Le rôle d'un développeur implique régulièrement des interactions avec des équipes ou des parties prenantes (confirmation de déploiement, réponse technique, notification d'incident).

> **mAI CLI intègre des connecteurs de messagerie :**
> L'outil peut se relier à Reddit, WhatsApp, Discord et Twitter (X) afin d'émettre des notifications ou des messages directement depuis la session de terminal.

| Cas d'usage | Action réalisée en terminal |
| --- | --- |
| Compilation ou test en cours | Réponse directe à un message via WhatsApp |
| Validation d'une pull request | Notification d'équipe sur Discord |
| Déploiement finalisé | Publication d'un statut technique sur X |
| Surveillance d'un fil d'incident | Intervention technique sur Reddit |

Cette centralisation limite la dispersion attentionnelle et regroupe le pilotage technique au même endroit.

---

## Modèle BYOK (Bring Your Own Key)

mAI CLI repose sur le principe du **BYOK (Bring Your Own Key)** :

Chaque utilisateur configure sa propre clé d'accès auprès du fournisseur de son choix (OpenAI, Anthropic, Google Gemini, Groq, Ollama en local).

- **Indépendance technologique** : Flexibilité totale dans le choix du moteur d'inférence.
- **Transparence des coûts** : Facturation directe auprès du fournisseur retenu, sans intermédiaire.
- **Sélection adaptée** : Utilisation d'un modèle léger pour les tâches courantes et d'un modèle plus capacitaire pour les revues d'architecture.
- **Confidentialité** : Les clés d'accès et requêtes demeurent sous votre gouvernance exclusive.

### Fournisseur mAI en préparation

Un connecteur dédié mAI est en cours de développement afin de permettre l'évaluation rapide de modèles sans configuration préalable requise.

---

## Guide d'installation

mAI CLI est compatible avec **macOS**, **Linux**, **WSL** et **Windows**.

### macOS (Homebrew)

```bash
brew install mDevsLabs/mAI-CLI/mai
```

### Linux / WSL

**Canal stable (branche `main`) :**
```bash
curl -fsSL https://raw.githubusercontent.com/mDevsLabs/mAI-CLI/main/scripts/install-remote.sh | bash
```

**Canal canary (branche `canary`) :**
```bash
curl -fsSL https://raw.githubusercontent.com/mDevsLabs/mAI-CLI/canary/scripts/install-canary.sh | bash
```

### Windows 10 / 11

**Canal stable (branche `main`) :**
```cmd
powershell -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/mDevsLabs/mAI-CLI/main/scripts/install-remote.ps1 | iex"
```

**Canal canary (branche `canary`) :**
```cmd
powershell -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/mDevsLabs/mAI-CLI/canary/scripts/install-canary.ps1 | iex"
```

### Installation depuis les sources

```bash
git clone https://github.com/mDevsLabs/mAI-CLI.git
cd mAI-CLI
bash scripts/install-user.sh       # macOS / Linux / WSL
powershell -ExecutionPolicy Bypass -File scripts\install-user.ps1   # Windows
```

### Mise à jour

```bash
mai --update
```

### Choix du canal

| Canal | Branche | Recommandé pour |
| --- | --- | --- |
| **Stable** | `main` | Utilisation quotidienne et environnements de production |
| **Canary** | `canary` | Évaluation des fonctionnalités en préversion |

---

## Public cible

mAI CLI est destiné aux ingénieurs logiciels, développeurs indépendants et équipes techniques recherchant un outillage rigoureux, direct et sans friction visuelle.

---

## Accès anticipé et contributions

Le projet est ouvert aux contributions et aux retours techniques de la communauté via le dépôt officiel :

### Dépôt GitHub : [github.com/mDevsLabs/mAI-CLI](https://github.com/mDevsLabs/mAI-CLI)

---

## Conclusion

mAI CLI repose sur trois piliers fondamentaux :
1. **Intégration native au terminal** ;
2. **Liberté de choix du modèle d'inférence (BYOK)** ;
3. **Unification des flux de codage et de communication opérationnelle**.

---

**mDevsLabs / mAI**  
Documentation et sources : [github.com/mDevsLabs/mAI-CLI](https://github.com/mDevsLabs/mAI-CLI)

