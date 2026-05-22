# Confidentialité et Sécurité 🔒

La sécurité de vos données et le respect de votre vie privée sont fondamentaux dans la conception de **mAI**.

## Stockage local chiffré

Toutes vos données sensibles sont stockées localement sur votre appareil :
- **Clés API** : Elles sont chiffrées à l'aide d'algorithmes standard de l'industrie avant d'être sauvegardées dans votre stockage local. Vos clés API ne transitent jamais par nos serveurs ; elles sont envoyées directement depuis votre appareil vers les serveurs des fournisseurs de LLM respectifs.
- **Historique de chat** : Vos discussions restent sur votre machine (sauf si vous activez explicitement la synchronisation cloud sécurisée).

## Connexions sécurisées

Toutes les requêtes sortantes vers les APIs des modèles de langage s'effectuent via des protocoles de communication sécurisés (HTTPS / SSL), garantissant que les données échangées ne peuvent pas être interceptées sur le réseau.

## Utilisation recommandée en entreprise

Pour un niveau maximal de sécurité en entreprise :
- Utilisez des modèles hébergés localement via **Ollama** ou un serveur d'inférence privé (pas de données sortant du réseau d'entreprise).
- Désactivez la télémétrie anonyme dans les paramètres généraux.
