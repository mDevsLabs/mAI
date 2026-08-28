# Disponibilité du suivi des quotas et gestion du compte mAI

![Compte mAI](https://upload.fs.fr/acJN4xd9ys.png)

L'écosystème **mAI** intègre de nouvelles fonctionnalités d'administration pour offrir une visibilité complète sur la consommation de ressources. Le **suivi des quotas** et le **compte mAI unifié** sont désormais directement accessibles depuis la plateforme **mAI**.

Cette intégration centralise la gestion de profil, le suivi d'utilisation des modèles et l'administration des forfaits au sein d'une interface unique.

---

## Fonctionnement du suivi des quotas mAI

Chaque requête adressée aux modèles **mAI** mobilise un volume de *tokens*. Afin de garantir une répartition équitable des ressources d'inférence, un système de **quotas hebdomadaires** est appliqué.

Depuis le tableau de bord, vous pouvez suivre en temps réel :

- **Le volume de tokens consommés** par rapport au plafond hebdomadaire alloué.
- **Le taux d'utilisation** du quota, représenté par un indicateur visuel de progression.
- **La date et l'heure de réinitialisation**, indiquant le moment précis du renouvellement du quota.
- **Le forfait associé** (Free, Plus, Pro ou Max).

Un contrôle d'actualisation permet de synchroniser instantanément l'état des compteurs avec les services backend.

---

## Le Compte mAI unifié

Le **Compte mAI** constitue le point d'accès centralisé entre **mAI** et l'ensemble des services de **mDevsLabs**. Il regroupe :

### Profil et identité
- **Informations de compte** : Nom d'utilisateur et adresse de messagerie associée.
- **Niveau d'abonnement** : Affichage du forfait actif (Free, Plus, Pro, Max).
- **Identifiant visuel** : Génération automatique des initiales de profil.

### Gestion des forfaits
- **Suivi d'utilisation** : Visualisation claire de la consommation de tokens (consommés / maximum).
- **Mise à niveau** : Activation de codes d'évolution (*Plus*, *Pro* ou *Max*) pour étendre instantanément les capacités de traitement.

### Outils et accès développeur
- **Clés API** : Console de génération et d'administration des clés d'accès programmatiques.
- **mAI CLI** : Accès direct à la documentation et aux commandes d'installation de l'interface terminal.

---

## Plafonds hebdomadaires par forfait

La grille ci-dessous détaille le volume hebdomadaire de tokens (entrée et sortie confondues) attribué par niveau :

*Remarque : Aucune limitation restrictive de débit par minute (RPM/TPM) n'est imposée. Seul le volume total hebdomadaire de tokens fait l'objet d'un décompte.*

| Forfait | Plafond de tokens / semaine |
|---|---|
| **Community / Free** | 2 000 000 |
| **Plus** | 5 000 000 |
| **Pro** | 10 000 000 |
| **Max** | 20 000 000 |

*En cas d'atteinte du plafond alloué, l'accès aux modèles est suspendu jusqu'à la réinitialisation hebdomadaire suivante.*

---

## Accéder à votre espace compte mAI

1. Connectez-vous à votre espace utilisateur sur [le portail mAI](/).
2. Rendez-vous sur la page **[Mon compte](/account)**.
3. Consultez le tableau de bord analytique et l'état de vos quotas.
4. Le cas échéant, appliquez un code d'évolution pour ajuster votre forfait.

---

## Synthèse

- Suivi en temps réel de la consommation hebdomadaire de tokens.
- Compte unifié entre mAI et l'écosystème mDevsLabs.
- Gestion fluide des niveaux de service via des codes d'activation.
- Administration directe des clés API et de l'outil mAI CLI.
- Renouvellement automatique hebdomadaire des quotas.

Ces fonctionnalités sont dès à présent actives et accessibles depuis votre espace [mAI](/).

---

*Équipe mAI – mDevsLabs*
