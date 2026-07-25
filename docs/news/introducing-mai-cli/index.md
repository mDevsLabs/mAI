\# mAI CLI : l'assistant de développement qui vit dans votre terminal



> \*\*mDevsLabs / mProjects\*\* annonce l'ouverture en \*\*accès anticipé\*\* de \*\*mAI CLI\*\*, un outil de développement assisté par intelligence artificielle conçu pour s'intégrer nativement au terminal. Gratuit, ouvert et compatible avec les modèles de votre choix.



\---



\## Sommaire



1\. \[Le terminal n'a jamais cessé d'être le centre du travail](#le-terminal-na-jamais-cessé-dêtre-le-centre-du-travail)

2\. \[Ce que mAI CLI sait faire](#ce-que-mai-cli-sait-faire)

3\. \[La communication intégrée](#la-fonctionnalité-qui-nexiste-nulle-part-ailleurs--la-communication-intégrée)

4\. \[BYOK : vos clés, vos modèles, vos règles](#byok--vos-clés-vos-modèles-vos-règles)

5\. \[Installation](#installation)

6\. \[À qui s'adresse mAI CLI](#à-qui-sadresse-mai-cli)

7\. \[Un accès anticipé, et ce que cela implique](#un-accès-anticipé-et-ce-que-cela-implique)

8\. \[Pour conclure](#pour-conclure)



\---



\## Le terminal n'a jamais cessé d'être le centre du travail



Malgré des années d'innovation dans les environnements de développement, une constante demeure : \*\*le terminal reste l'endroit où le travail se termine\*\*. C'est là que l'on construit, que l'on teste, que l'on déploie, que l'on inspecte les journaux d'erreurs et que l'on valide une dernière fois avant de livrer.



Pourtant, la plupart des outils d'assistance par intelligence artificielle ont choisi de s'installer ailleurs : dans une fenêtre de navigateur, dans un panneau latéral, dans une extension. Le résultat est connu de tous les développeurs : une succession d'allers-retours entre les fenêtres, des copier-coller de contexte, une perte de fil constante.



\*\*mAI CLI part d'un principe inverse.\*\* Plutôt que de demander au développeur de venir vers l'assistant, l'assistant s'installe là où le développeur se trouve déjà. Pas d'interface à apprendre, pas de nouvel onglet à surveiller : une commande, `mai`, et l'outil devient un interlocuteur disponible dans la session que vous aviez déjà ouverte.



Aujourd'hui, mDevsLabs annonce l'ouverture publique de mAI CLI en \*\*accès anticipé\*\*. Le dépôt est public, l'installation prend moins d'une minute, et l'utilisation est entièrement gratuite.



\---



\## Ce que mAI CLI sait faire



mAI CLI n'est pas un simple générateur de texte branché sur une invite de commande. C'est un assistant capable d'\*\*agir concrètement\*\* sur votre environnement de travail, dans un périmètre que vous contrôlez.



\### 🔍 Passer en revue une pull request



L'une des tâches les plus consommatrices d'attention dans une équipe — et l'une des plus solitaires quand on travaille seul — est la relecture de code. mAI CLI est capable d'analyser les modifications introduites par une pull request, d'en résumer l'intention, de signaler les points qui méritent une attention particulière et de restituer le tout sous une forme lisible, directement dans le terminal.



L'objectif n'est pas de remplacer votre jugement. Il est de vous faire gagner la première passe : celle où l'on comprend ce qui a changé, où l'on identifie les fichiers sensibles, où l'on repère une incohérence évidente. Vous arrivez ensuite sur la relecture humaine avec une carte du terrain déjà dessinée.



\### 🐛 Gérer les tickets et les anomalies



Les tickets s'accumulent. Certains sont clairs, d'autres sont des captures d'écran accompagnées de trois mots. mAI CLI vous aide à traiter ce flux :



\- consulter les tickets ouverts ;

\- en résumer le contenu ;

\- faire le lien avec le code concerné ;

\- proposer une piste de correction ;

\- remettre de l'ordre dans une liste qui a grossi trop vite.



Pour un développeur indépendant, c'est un gain de temps immédiat. Pour un profil confirmé qui jongle entre plusieurs projets, c'est un moyen de reprendre le contexte d'un dossier laissé de côté depuis deux semaines.



\### 📄 Lire, écrire et modifier des fichiers



mAI CLI dispose d'un accès à votre système de fichiers. Il peut ouvrir un fichier pour comprendre une implémentation, en parcourir plusieurs pour reconstituer la logique d'un module, puis proposer et appliquer des modifications.



Cette capacité est ce qui distingue un assistant réellement utile d'un outil de conversation. Lorsqu'il vous répond, mAI CLI ne devine pas ce que contient votre projet : \*\*il l'a lu\*\*.



\### ⚡ Exécuter des commandes



Compiler, lancer une suite de tests, vérifier l'état d'un dépôt, inspecter un journal : mAI CLI peut exécuter des commandes pour vous et interpréter ce qu'elles renvoient. Une erreur de compilation devient alors une information exploitable plutôt qu'un mur de texte à décrypter.



C'est aussi ce qui permet un cycle complet : comprendre un problème, proposer une correction, l'appliquer, relancer la construction, vérifier le résultat.



\---



\## La fonctionnalité qui n'existe nulle part ailleurs : la communication intégrée



Voici ce qui rend mAI CLI singulier, et ce à quoi nous tenons le plus.



Un développeur ne fait pas que du code. Il prévient une équipe qu'une correction est en ligne. Il répond à une question dans un canal Discord. Il envoie un message à un client qui attend une réponse depuis ce matin. Il publie une note sur un fil de discussion communautaire. Il répond à un message professionnel sur WhatsApp.



Ces interruptions ne sont pas accessoires : \*\*elles font partie du métier\*\*. Mais chacune d'entre elles impose de quitter le terminal, d'ouvrir une application, de retrouver la bonne conversation — et de perdre, au passage, le fil de ce que l'on était en train de faire.



> \*\*mAI CLI intègre nativement la messagerie.\*\*

> L'outil peut se connecter à \*\*Reddit\*\*, \*\*WhatsApp\*\*, \*\*Discord\*\* et \*\*Twitter (X)\*\* et envoyer des messages depuis votre session de terminal, sans que vous ayez à changer de fenêtre.



Concrètement, cela signifie que vous pouvez :



| Situation | Action possible sans quitter le terminal |

| --- | --- |

| Une construction longue est en cours | Répondre à un message client sur \*\*WhatsApp\*\* |

| Une pull request vient d'être validée | Prévenir l'équipe sur \*\*Discord\*\* |

| Un déploiement se termine | Publier l'annonce de mise à jour sur \*\*X\*\* |

| Un test d'intégration s'exécute | Répondre à une question technique sur \*\*Reddit\*\* |



À notre connaissance, aucun autre assistant en ligne de commande ne propose cette combinaison. Elle change la nature de l'outil : mAI CLI cesse d'être uniquement un assistant de code pour devenir un \*\*poste de commandement\*\*, d'où l'on pilote à la fois le projet et les échanges qui l'entourent.



C'est une réponse directe à une réalité que connaissent particulièrement bien les développeurs indépendants : ils sont simultanément l'ingénieur, le support client et la communication. Réunir ces rôles en un seul endroit n'est pas un gadget, \*\*c'est une économie d'énergie quotidienne\*\*.



\---



\## BYOK : vos clés, vos modèles, vos règles



mAI CLI fonctionne selon le principe du \*\*BYOK — \_Bring Your Own Key\_\*\*, littéralement « apportez votre propre clé ».



Vous choisissez votre fournisseur d'intelligence artificielle parmi une large sélection, vous renseignez votre clé d'accès, puis vous sélectionnez le modèle que vous souhaitez utiliser. C'est tout.



Ce choix technique a plusieurs conséquences importantes :



\- \*\*Vous n'êtes lié à personne.\*\* Si un fournisseur augmente ses tarifs, dégrade ses performances ou modifie ses conditions, vous changez de modèle en quelques secondes. Votre outil de travail ne dépend pas des décisions commerciales d'un tiers.

\- \*\*Vous payez le juste prix.\*\* Vous utilisez directement la facturation de votre fournisseur, sans intermédiaire ni marge ajoutée. Il n'y a pas d'abonnement à mAI CLI, parce qu'il n'y a rien à facturer.

\- \*\*Vous adaptez le modèle à la tâche.\*\* Un modèle rapide et économique pour reformuler un message ou résumer un ticket. Un modèle plus puissant pour analyser une architecture complexe ou relire une pull request délicate.

\- \*\*Vous gardez la maîtrise.\*\* Vos clés vous appartiennent et restent sous votre contrôle. Aucune couche intermédiaire ne s'interpose entre votre machine et le fournisseur que vous avez choisi.



\### 🚧 Un fournisseur mAI en préparation



Nous avons conscience que le BYOK impose une étape initiale : créer un compte chez un fournisseur, générer une clé, la configurer. Pour un développeur confirmé, c'est une formalité. Pour quelqu'un qui souhaite simplement essayer l'outil, c'est un frein.



C'est pourquoi nous travaillons à l'intégration d'un \*\*fournisseur mAI\*\*, qui permettra de tester différents modèles \*\*sans abonnement et sans configuration préalable\*\*. L'idée est simple : installer, lancer, essayer. Ceux qui souhaiteront ensuite utiliser leurs propres clés le pourront à tout moment.



> ℹ️ Cette fonctionnalité est en cours de développement et fera l'objet d'une annonce dédiée.



\---



\## Installation



mAI CLI est disponible sur \*\*macOS\*\*, \*\*Linux\*\*, \*\*WSL\*\* et \*\*Windows\*\*.



\### macOS (Homebrew)



```bash

brew install mDevsLabs/mAI-CLI/mai

```



\### Linux / WSL



\*\*Version stable (branche `main`)\*\*



```bash

curl -fsSL https://raw.githubusercontent.com/mDevsLabs/mAI-CLI/main/scripts/install-remote.sh | bash

```



\*\*Version canary (branche `canary`)\*\*



```bash

curl -fsSL https://raw.githubusercontent.com/mDevsLabs/mAI-CLI/canary/scripts/install-canary.sh | bash

```



\### Windows 10 / 11



\*\*Version stable (branche `main`)\*\*



```cmd

powershell -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/mDevsLabs/mAI-CLI/main/scripts/install-remote.ps1 | iex"

```



\*\*Version canary (branche `canary`)\*\*



```cmd

powershell -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/mDevsLabs/mAI-CLI/canary/scripts/install-canary.ps1 | iex"

```



\### Depuis les sources (toutes plateformes)



```bash

git clone https://github.com/mDevsLabs/mAI-CLI.git

cd mAI-CLI

bash scripts/install-user.sh       # macOS / Linux / WSL

powershell -ExecutionPolicy Bypass -File scripts\\install-user.ps1   # Windows

```



\### Mise à jour



```bash

mai --update

```



\### Quel canal choisir ?



| Canal | Branche | Recommandé pour |

| --- | --- | --- |

| \*\*Stable\*\* | `main` | L'usage quotidien et les environnements de production |

| \*\*Canary\*\* | `canary` | Découvrir les nouveautés en avance et contribuer aux retours |



\---



\## À qui s'adresse mAI CLI



mAI CLI a été pensé pour les \*\*développeurs confirmés\*\* et les \*\*développeurs indépendants\*\*.



\*\*Confirmés\*\*, parce que l'outil ne cherche pas à masquer la complexité : il suppose que vous savez ce que vous faites, que vous êtes à l'aise dans un terminal, et que vous préférez un outil précis à un outil qui vous tient la main.



\*\*Indépendants\*\*, parce que ce sont eux qui cumulent le plus de rôles. Quand une seule personne assure le développement, la relecture, le déploiement, le support et la communication, chaque changement de contexte évité représente un gain réel.



> Si vous vous êtes déjà retrouvé avec une construction en cours, une pull request à relire et trois messages en attente, mAI CLI a été conçu pour cette situation exactement.



\---



\## Un accès anticipé, et ce que cela implique



mAI CLI entre aujourd'hui en \*\*accès anticipé public\*\*. Cela signifie que l'outil est utilisable dès maintenant, gratuitement, et que son développement se poursuit activement.



Cela signifie aussi que \*\*nous comptons sur vous\*\*. Les retours de cette phase orienteront directement les prochaines versions : quelles intégrations prioriser, quels fournisseurs ajouter, quels comportements ajuster. Un signalement d'anomalie, une suggestion, une remarque sur un détail d'ergonomie — tout est utile.



Le dépôt est public et ouvert :



\### 👉 \[github.com/mDevsLabs/mAI-CLI](https://github.com/mDevsLabs/mAI-CLI)



Vous y trouverez la documentation complète, la liste des fournisseurs pris en charge, le suivi des tickets et les instructions pour contribuer.



\---



\## Pour conclure



mAI CLI repose sur trois convictions.



1\. \*\*Le terminal est le bon endroit.\*\* Un assistant de développement doit s'y trouver, pas à côté.

2\. \*\*Le choix du modèle appartient au développeur.\*\* Le BYOK n'est pas une contrainte technique, c'est une garantie d'indépendance.

3\. \*\*Coder, c'est aussi communiquer.\*\* En intégrant Reddit, WhatsApp, Discord et X directement dans l'outil, nous reconnaissons une partie du métier que les autres outils ignorent.



L'accès anticipé est ouvert. L'installation prend une minute. Le reste vous appartient.



\---



\*\*mDevsLabs / mProjects\*\*

🔗 \[github.com/mDevsLabs/mAI-CLI](https://github.com/mDevsLabs/mAI-CLI)

