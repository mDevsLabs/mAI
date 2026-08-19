"use client";

import { motion } from "motion/react";
import { Shield, ArrowLeft, Lock,   Key, Database, Cookie, Zap } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/60 transition-all duration-300 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l'accueil
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
      >
        <div className="inline-flex items-center justify-center p-4 mb-6 rounded-full bg-purple-100 text-purple-600">
          <Shield className="w-8 h-8" />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900 mb-6">
          Politique de <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500">Confidentialité</span> 🛡️
        </h1>

        <p className="text-slate-500 font-light mb-10 text-base md:text-lg">
          Dernière mise à jour : 1er août 2026. Chez mDevsLabs, nous accordons une importance capitale à la protection de vos données personnelles et au respect de votre vie privée. Cette politique détaille le traitement de vos données avec l'intégration de la nouvelle API mAI, la gestion des clés API et les cookies de session.
        </p>

        <div className="space-y-8 text-slate-600">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-500" />
              1. Données Collectées &amp; Clés API mAI
            </h2>
            <p className="leading-relaxed font-light">
              <strong>Compte Utilisateur</strong> : Nous collectons votre adresse e-mail, votre nom d'utilisateur, le type de forfait souscrit (Free, Plus, Pro, Max) ainsi que votre mot de passe chiffré.
            </p>
            <p className="leading-relaxed font-light mt-2">
              <strong>Clés API &amp; Authentification</strong> : Lorsque vous générez une clé API (ex: <code className="bg-purple-50 px-1.5 py-0.5 rounded text-purple-700 font-mono text-xs">mp-...</code>), le jeton secrit est généré de manière sécurisée et enregistré en base de données PostgreSQL (Neon DB). Vos clés sont associées de manière stricte à votre identifiant d'utilisateur.
            </p>
            <p className="leading-relaxed font-light mt-2">
              <strong>Journaux d'Exécution API (mprojects_api_logs)</strong> : Pour chaque appel d'API vers nos points de terminaison (<code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">/v1/chat/completions</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">/v1/models</code>), nous enregistrons automatiquement :
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-4 text-sm font-light">
              <li>Le préfixe de la clé API utilisée pour authentifier la requête</li>
              <li>Le point de terminaison sollicité et la méthode HTTP (GET, POST)</li>
              <li>Le code de statut HTTP renvoyé (200, 401, 403, 429)</li>
              <li>La latence de traitement exprimée en millisecondes</li>
              <li>L'horodatage exact de l'exécution</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-500" />
              2. Forfaits &amp; Quotas d'Usage API
            </h2>
            <p className="leading-relaxed font-light">
              L'utilisation des API est régie par un système de quotas mensuels basés sur votre formule d'abonnement :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-white/70 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-900">Forfait Free (Gratuit)</p>
                <p className="text-slate-600 mt-1">1 000 requêtes / mois. Accès aux modèles comportant <code className="text-purple-600">:free</code>.</p>
              </div>
              <div className="p-3 bg-white/70 rounded-2xl border border-slate-200">
                <p className="font-bold text-purple-700">Forfait Plus</p>
                <p className="text-slate-600 mt-1">5 000 requêtes / mois. Accès complet à tous les modèles Cloud &amp; Locaux.</p>
              </div>
              <div className="p-3 bg-white/70 rounded-2xl border border-slate-200">
                <p className="font-bold text-blue-700">Forfait Pro</p>
                <p className="text-slate-600 mt-1">25 000 requêtes / mois. Accès prioritaire et limites de débit accrues.</p>
              </div>
              <div className="p-3 bg-white/70 rounded-2xl border border-slate-200">
                <p className="font-bold text-emerald-700">Forfait Max</p>
                <p className="text-slate-600 mt-1">100 000 requêtes / mois. Support entreprise et quotas maximaux.</p>
              </div>
            </div>
            <p className="leading-relaxed font-light text-xs text-slate-500 mt-2">
              Chaque requête valide vers l'API incrémente votre compteur global de +1. Le quota est automatiquement réinitialisé le 1er jour de chaque mois calendaire.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-amber-500" />
              3. Cookies et Stockage Navigateur
            </h2>
            <p className="leading-relaxed font-light">
              Nous utilisons des cookies sécurisés et des mécanismes de stockage local (<code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">localStorage</code>) pour assurer le bon fonctionnement de la plateforme :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-sm font-light">
              <li>
                <strong className="text-slate-800">mai_token &amp; mai_user</strong> : Cookies essentiels de session permettant de vous maintenir connecté sans réinterroger le serveur à chaque changement de page.
              </li>
              <li>
                <strong className="text-slate-800">mai_cookie_consent</strong> : Stocke vos choix en matière de consentement RGPD.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              4. Sécurité &amp; Conservation des Données
            </h2>
            <p className="leading-relaxed font-light">
              Toutes les données de session et les requêtes API sont transmises au moyen de protocoles de chiffrement SSL/TLS (HTTPS). Vos requêtes API vers les modèles d'intelligence artificielle ne sont pas revendues ni réutilisées à des fins publicitaires.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              5. Vos Droits (RGPD)
            </h2>
            <p className="leading-relaxed font-light">
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Vous pouvez à tout moment révoquer une clé API ou demander la suppression de votre compte depuis votre espace client mAI.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}