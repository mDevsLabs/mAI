# Règles de rédaction du Changelog 📝

Ce document décrit comment rédiger et nommer les fichiers de changelog dans ce projet.

## 1. Convention de nommage des fichiers 📁
Tous les fichiers de changelog générés ou créés pour documenter une version doivent être créés dans le répertoire [docs/changelog](file:///C:/Users/maria/Desktop/MATHIAS/Dossiers%20Mathias/mCompany/mAI%20%28Officiel%29/docs/changelog) et respecter strictement le format suivant :
`XXX-XX-XX-XXXX.md`

Où :
* `XXX` : Le numéro de version sans points (ex: `004` pour `0.0.4`, `220` pour `2.2.0`).
* `XX` (premier) : Le jour de publication (ex: `29` pour le 29 du mois).
* `XX` (deuxième) : Le mois de publication (ex: `05` pour mai).
* `XXXX` : L'année de publication sur 4 chiffres (ex: `2026`).

**Exemple concret pour la version 0.0.4 publiée le 29 mai 2026 :**
`004-29-05-2026.md`

## 2. Structure et format ✍️
Les notes de version doivent comporter :
- Un titre de version au format `### Version X.Y.Z`
- Une date de publication au format `<sup>Released on **AAAA-MM-JJ**</sup>`
- Les catégories d'améliorations sous forme de listes (ex: `#### 🚀 Features`, `#### 🐛 Bug Fixes`, `#### 💄 Styles`).
