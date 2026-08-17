---
title: "Bonnes Pratiques"
description: "Conseils et recommandations pour intégrer efficacement les API mAI dans vos applications."
category: "API"
order: 10
---

# Bonnes Pratiques de l'API 💡🛠️

Pour exploiter au mieux les capacités de la suite **mAI** et de nos modèles (mAI-1.5, mAI-1.2, mAI-1), voici les recommandations techniques à suivre.

---

## 🔒 Gestion Sécurisée des Clés API

- **Ne jamais exposer vos clés côté client** : N'utilisez pas de clés d'accès directement dans du code Javascript exécuté sur le navigateur. Utilisez toujours un serveur intermédiaire (Backend / proxy) pour masquer vos clés.
- **Principe du moindre privilège** : Si possible, utilisez des clés d'accès distinctes pour le développement et la production.
- **Révocation proactive** : Si vous suspectez qu'une clé API a été compromise, révoquez-la immédiatement depuis la console développeur et générez-en une nouvelle.

---

## ⚡ Optimisation des Performances & Latence

- **Sélection du modèle approprié** :
  - Utilisez **mAI-1.5-Light** pour les tâches de classification, d'extraction rapide, d'autocomplétion.
  - Utilisez **mAI-1.5-Apex** et **mAI-1.5-Opal** pour le raisonnement approfondi et le codage expert.
- **Taille de contexte ajustée** : Limitez le paramètre `max_tokens` dans vos requêtes pour réduire le temps de calcul et accélérer le *Time To First Token* (TTFT).

---

## 🔄 Gestion des Limites d'Utilisation

L'API mAI est soumise à des limites d'appels configurées sur chaque clé.
- **Surveillez les limites** : Gérez l'erreur `429 Usage Limit Exceeded` de façon robuste dans votre application avec une stratégie de retry exponentiel (*exponential backoff*).
- Si vos limites d'utilisation sont atteintes, créez une nouvelle clé ou augmentez le quota d'usage depuis la console de gestion des clés.
