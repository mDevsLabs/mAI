---
title: "Guide d'installation Application Android"
description: "Guide d'installation, de configuration et d'utilisation pour l'application mAI sur les appareils mobiles Android."
category: "Guides"
order: 15
---

# Guide d'installation Application Android 

L'application mobile **mAI pour Android** vous permet d'emporter votre assistant IA local directement sur votre smartphone ou tablette. Profitez de toute la puissance de mAI en mobilité avec une interface tactile optimisée.

---

## 1. Téléchargement & Extraction

1. Téléchargez l'archive officielle de l'application Android : [mAI-Android.zip](https://upload.fs.fr/i4Bw0kQXk7.zip).
2. Décompressez l'archive ZIP sur votre ordinateur ou directement sur votre appareil Android à l'aide d'une application de gestion de fichiers (comme Files by Google ou Solid Explorer).
3. Une fois extrait, vous obtiendrez un fichier d'installation nommé `mAI-mobile.apk` (ou similaire).

---

## 2. Autoriser les sources inconnues (Sideloading)

Pour installer une application en dehors du Google Play Store, vous devez autoriser votre navigateur ou gestionnaire de fichiers à installer des applications inconnues :

1. Ouvrez les **Paramètres** de votre appareil Android.
2. Allez dans **Applications** > **Accès spécial** > **Installer des applications inconnues** (le chemin peut varier selon votre constructeur : Samsung, Xiaomi, Pixel...).
3. Sélectionnez l'application que vous utilisez pour ouvrir l'APK (par exemple, votre navigateur Chrome ou votre Gestionnaire de fichiers) et activez l'option **Autoriser cette source**.

---

## 3. Installation et Lancement

1. Appuyez sur le fichier `mAI-mobile.apk` extrait à l'étape 1.
2. Une boîte de dialogue s'affiche pour vous demander si vous souhaitez installer cette application. Appuyez sur **Installer**.
3. Une fois l'installation terminée, appuyez sur **Ouvrir** pour lancer mAI.
4. L'icône de l'application mAI apparaîtra désormais sur votre écran d'accueil et dans votre tiroir d'applications.

---

## 4. Configuration de la connexion locale

L'application mAI Mobile se connecte à votre instance locale mAI tournant sur votre ordinateur ou serveur :

1. Assurez-vous que votre smartphone et votre ordinateur sont connectés au **même réseau Wi-Fi**.
2. Sur votre ordinateur, lancez votre serveur local mAI (ou Ollama).
3. Dans l'application mAI sur votre smartphone, accédez aux **Paramètres** (icône d'engrenage).
4. Saisissez l'adresse IP locale de votre ordinateur suivie du port utilisé (ex: `http://192.168.1.50:11434` ou le port de mAI).
5. Appuyez sur **Tester la connexion** pour lier votre appareil à votre assistant local.
