---
title: "Sécurité, Confidentialité & RGPD"
description: "Architecture de sécurité, conformité RGPD, répartition du stockage UE/USA et politique prioritaire Zero Data Retention (ZDR)."
category: "Guides"
order: 7
---

# Sécurité, Confidentialité & Conformité RGPD 

La sécurité des infrastructures et la confidentialité absolue des données de nos utilisateurs et développeurs sont les priorités fondamentales de l'architecture logicielle **mDevsLabs**.

---

## 1. Piliers Fondamentaux de la Sécurité mAI

1. **Priorité Absolue au Zero Data Retention (ZDR)** : Vos invites (prompts), données métier, code source et contenus générés ne sont jamais persistés ni exploités pour réentraîner des modèles d'IA.
2. **Isolation & Inférence Stateless** : Traitement éphémère en mémoire vive (RAM) volatile, avec purge automatique dès la fin de la diffusion de tokens (*token streaming*).
3. **Chiffrement de Bout en Bout** : Communications protégées par TLS 1.3 / HTTPS et données au repos sécurisées par chiffrement de niveau bancaire (AES-256).
4. **Anonymisation Dynamique des PII** : Masquage en temps réel des données personnelles sensibles (adresses e-mail, identifiants, tokens, coordonnées financières).

---

## 2. Répartition du Stockage & Souveraineté des Données

mDevsLabs applique une stricte politique de gouvernance des données :

```text

               RÉPARTITION DU STOCKAGE DES DONNÉES mAI                  

   DONNÉES STRUCTURÉES (UE )          FICHIERS & OBJETS (USA )     

 • Comptes utilisateurs & profils   • Stockage mAI Cloud Storage       
 • Bases relationnelles PostgreSQL  • Images générées & exports médias 
 • Clés d'API & quotas de forfaits  • Chiffrement AES-256 au repos     
 • Journaux techniques sécurisés    • Clauses Contractuelles Types     
 • Hébergement Francfort (RGPD)     • Transport sécurisé TLS 1.3       

```

---

## 3. Protection & Prévention des Attaques

### Module mAI-Guard
Le sous-système de sécurité **mAI-Guard** analyse les flux entrants et sortants pour neutraliser :
- Les tentatives d'injection de directives (*Prompt Injection*).
- Les contournements de contraintes de sécurité (*Jailbreak*).
- L'exfiltration non sollicitée d'instructions système (*System Prompt Extraction*).

```bash
# Configuration de la politique de sécurité mAI-Guard
export MDEVS_SECURITY_GUARD="strict"
export MDEVS_ZDR_ENFORCED="true"
```

---

## 4. Gestion Cryptographique des Clés API

### Format Standardisé
Toutes les clés d'API délivrées par mAI adoptent le format cryptographique suivant :
`mp-[48 caractères hexadécimaux]` *(ex: `mp-a1b2c3d4e5f678901234567890abcdef1234567890abcdef`)*.

### Règles de Gestion des Clés
- **Stockage Cryptographique** : Les clés sont stockées sous forme de hachage SHA-256 en base de données.
- **Révocation Instantanée** : Tout identifiant compromis peut être révoqué et régénéré en un clic depuis la console `/account/keys`.
- **Limitation de Débit & Quotas** : Protection proactive contre les abus par limitation granulaire de requêtes et surveillance des latences.

---

## 5. Assainissement & Nettoyage des Données (PII)

```python
from mdevslabs.security import DataCleaner

cleaner = DataCleaner(
    pii_patterns=[
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # E-mails
        r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b',             # Cartes bancaires
        r'\b(?:mp-|mai_)[a-zA-Z0-9_-]{16,}\b',                  # Clés d'API
    ],
    action="mask"  # "mask" ou "remove"
)

sanitized_prompt = cleaner.process(raw_user_input)
```

---

## 6. Conformité RGPD & Droits des Utilisateurs

Conformément au Règlement Général sur la Protection des Données (RGPD UE 2016/679) :
- **Droit d'accès et d'export** : Téléchargez l'intégralité de vos métadonnées de compte en format JSON standard.
- **Droit à l'effacement** : Procédez à la suppression immédiate et irréversible de votre compte et de toutes les données associées.
- **Délégué à la Protection des Données** : Contactez notre équipe dédiée via le portail de support ou par ticket technique.