"use client";

import { motion } from "motion/react";
import {
  Shield,
  ArrowLeft,
  Lock,
  Key,
  Database,
  Cookie,
  Globe,
  Server,
  Cpu,
  EyeOff,
  UserCheck,
  HardDrive,
  CheckCircle2,
} from "lucide-react";
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
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500">
            Confidentialité
          </span>{" "}
          🛡️
        </h1>

        <p className="text-slate-500 font-light mb-8 text-base md:text-lg">
          Dernière mise à jour : 23 août 2026. Chez <strong>mDevsLabs</strong>, la protection de vos données personnelles, la souveraineté européenne et la transparence de notre plateforme <strong>mAI</strong> sont au cœur de nos engagements. Cette politique détaille l'hébergement de vos données dans l'Union Européenne (UE), le traitement des requêtes via l'API mAI, l'absence de réentraînement sur vos données et la gestion sécurisée de vos clés d'API.
        </p>

        {/* Badge Résumé de Souveraineté UE & API */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900">
            <div className="flex items-center gap-2 font-bold text-sm mb-1 text-emerald-800">
              <Globe className="w-4 h-4 text-emerald-600" />
              Stockage 100% UE 🇪🇺
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed font-light">
              Bases de données et fichiers hébergés exclusivement dans des datacenters européens (RGPD).
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-900">
            <div className="flex items-center gap-2 font-bold text-sm mb-1 text-purple-800">
              <EyeOff className="w-4 h-4 text-purple-600" />
              Zéro Réentraînement 🔒
            </div>
            <p className="text-xs text-purple-700 leading-relaxed font-light">
              Vos prompts et requêtes API ne sont jamais utilisés pour entraîner ou affiner des modèles d'IA.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-900">
            <div className="flex items-center gap-2 font-bold text-sm mb-1 text-blue-800">
              <Key className="w-4 h-4 text-blue-600" />
              Clés API Sécurisées 🔑
            </div>
            <p className="text-xs text-blue-700 leading-relaxed font-light">
              Génération cryptographique, contrôle granulaire des quotas et révocation immédiate.
            </p>
          </div>
        </div>

        <div className="space-y-10 text-slate-600">
          {/* Section 1 : Stockage dans l'Union Européenne */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-emerald-600" />
              1. Hébergement et Stockage des Données dans l'Union Européenne (UE) 🇪🇺
            </h2>
            <p className="leading-relaxed font-light">
              Nous appliquons le principe de souveraineté et de localisation stricte des données au sein du territoire de l'<strong>Union Européenne</strong>. Vos données ne sont ni vendues, ni transférées vers des pays tiers sans garanties juridiques conformes aux exigences de la CNIL et du RGPD :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
              <div className="p-4 bg-white/70 rounded-2xl border border-slate-200/90 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Database className="w-4 h-4 text-emerald-600" />
                  Bases de données relationnelles
                </div>
                <p className="text-slate-600 leading-relaxed font-light">
                  Nos bases de données PostgreSQL managées (Neon DB) sont déployées dans la région <strong>EU (Europe centrale / Francfort)</strong> avec réplication et sauvegardes chiffrées.
                </p>
              </div>

              <div className="p-4 bg-white/70 rounded-2xl border border-slate-200/90 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  Stockage Fichiers (mAI Cloud Storage)
                </div>
                <p className="text-slate-600 leading-relaxed font-light">
                  Tous les fichiers, jeux de données et documents téléversés dans votre espace de stockage cloud sont stockés sur des infrastructures situées au sein de l'<strong>Espace Économique Européen</strong>.
                </p>
              </div>

              <div className="p-4 bg-white/70 rounded-2xl border border-slate-200/90 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Server className="w-4 h-4 text-purple-600" />
                  Serveurs d'Applications &amp; API
                </div>
                <p className="text-slate-600 leading-relaxed font-light">
                  Les passerelles de routage de l'API mAI et les moteurs d'orchestration s'exécutent sur des nœuds réseau européens sécurisés avec chiffrement de bout en bout.
                </p>
              </div>

              <div className="p-4 bg-white/70 rounded-2xl border border-slate-200/90 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Chiffrement Intégral (AES-256 &amp; TLS 1.3)
                </div>
                <p className="text-slate-600 leading-relaxed font-light">
                  Toutes les communications transitent via HTTPS/TLS 1.3 et les données stockées sont protégées au repos par un chiffrement conforme aux standards bancaires.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 : Données Collectées & Clés API mAI */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-purple-500" />
              2. Données Collectées &amp; Clés API mAI
            </h2>
            <p className="leading-relaxed font-light">
              Nous appliquons le principe de minimisation des données : seules les données strictement nécessaires à la fourniture de nos services d'IA sont traitées :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-sm font-light">
              <li>
                <strong>Données d'Identité &amp; Profil</strong> : Adresse e-mail valide, nom d'utilisateur unique, numéro de téléphone (optionnel), mot de passe sécurisé (haché de manière irréversible) et formule d'abonnement (Free, Plus, Pro, Max).
              </li>
              <li>
                <strong>Clés API &amp; Authentification</strong> : Les clés secrètes d'API générées (format <code className="bg-purple-50 px-1.5 py-0.5 rounded text-purple-700 font-mono text-xs">mai-...</code> ou <code className="bg-purple-50 px-1.5 py-0.5 rounded text-purple-700 font-mono text-xs">mp-...</code>) sont conservées de façon chiffrée et associées exclusivement à votre identifiant utilisateur. Vous pouvez les révoquer à tout moment.
              </li>
              <li>
                <strong>Journaux d'Exécution API (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">mprojects_api_logs</code>)</strong> : À chaque appel sur nos points de terminaison (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">/v1/chat/completions</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">/v1/models</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">/v1/messages</code>), nous enregistrons uniquement les métadonnées techniques suivantes :
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 ml-4">
                  <span className="p-2 rounded-xl bg-white/60 border border-slate-200 text-xs">🔹 Préfixe sécurisé de la clé API</span>
                  <span className="p-2 rounded-xl bg-white/60 border border-slate-200 text-xs">🔹 Point d'accès (endpoint) &amp; méthode HTTP</span>
                  <span className="p-2 rounded-xl bg-white/60 border border-slate-200 text-xs">🔹 Code de statut HTTP (200, 401, 403, 429)</span>
                  <span className="p-2 rounded-xl bg-white/60 border border-slate-200 text-xs">🔹 Latence en millisecondes &amp; tokens consommés</span>
                  <span className="p-2 rounded-xl bg-white/60 border border-slate-200 text-xs">🔹 Horodatage exact de la requête</span>
                </div>
              </li>
            </ul>
          </section>

          {/* Section 3 : Fonctionnement de l'API & Traitement des Requêtes IA */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-blue-500" />
              3. Traitement des Requêtes d'API &amp; Non-Entraînement des Modèles
            </h2>
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-slate-800 text-sm leading-relaxed space-y-2">
              <p className="font-bold flex items-center gap-2 text-blue-900">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Garantie de Non-Utilisation de vos Requêtes pour l'Entraînement :
              </p>
              <p className="font-light text-slate-700">
                Les invites (prompts), documents, messages, données de contexte et réponses générées transitant par l'API mAI ou l'interface web <strong>ne sont JAMAIS réutilisés pour entraîner, réentraîner ou améliorer nos modèles fondamentaux ou des modèles tiers</strong>.
              </p>
            </div>
            <p className="leading-relaxed font-light text-sm">
              <strong>Traitement Éphémère (Stateless)</strong> : Lorsque vous soumettez une requête à l'API, les données sont traitées en mémoire vive volatile par le moteur d'inférence afin de générer la complétion demandée. Dès l'envoi de la réponse à votre client ou application, le contenu textuel est immédiatement purgé de la mémoire active des serveurs d'inférence.
            </p>
          </section>

          {/* Section 4 : Forfaits & Quotas d'Usage API */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Key className="w-5 h-5 text-purple-500" />
              4. Forfaits, Quotas &amp; Gestion des Débits API
            </h2>
            <p className="leading-relaxed font-light">
              L'utilisation des ressources d'intelligence artificielle et des serveurs est équilibrée par un système de quotas mensuels selon votre formule :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3.5 bg-white/70 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-900">Forfait Free (Gratuit)</p>
                <p className="text-slate-600 mt-1">1 000 requêtes / mois. Accès exclusif aux modèles étiquetés <code className="text-purple-600 font-mono">:free</code>.</p>
              </div>
              <div className="p-3.5 bg-white/70 rounded-2xl border border-slate-200">
                <p className="font-bold text-purple-700">Forfait Plus</p>
                <p className="text-slate-600 mt-1">5 000 requêtes / mois. Accès à tous les modèles Cloud &amp; Locaux mAI.</p>
              </div>
              <div className="p-3.5 bg-white/70 rounded-2xl border border-slate-200">
                <p className="font-bold text-blue-700">Forfait Pro</p>
                <p className="text-slate-600 mt-1">25 000 requêtes / mois. Priorité de calcul et limites de débit accrues.</p>
              </div>
              <div className="p-3.5 bg-white/70 rounded-2xl border border-slate-200">
                <p className="font-bold text-emerald-700">Forfait Max</p>
                <p className="text-slate-600 mt-1">100 000 requêtes / mois. Quotas ultra-larges et support technique dédié.</p>
              </div>
            </div>
            <p className="leading-relaxed font-light text-xs text-slate-500 mt-1">
              Chaque requête valide vers l'API incrémente votre quota d'usage de +1. La réinitialisation des compteurs s'effectue automatiquement le premier jour de chaque mois calendaire à 00:00 UTC.
            </p>
          </section>

          {/* Section 5 : Cookies et Stockage Navigateur */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Cookie className="w-5 h-5 text-amber-500" />
              5. Cookies et Stockage Local
            </h2>
            <p className="leading-relaxed font-light">
              Nous n'utilisons aucun traceur publicitaire tiers. Nous exploitons uniquement des cookies strictement nécessaires au fonctionnement et à la sécurité de l'application :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-sm font-light">
              <li>
                <strong className="text-slate-800">mai_token &amp; mai_user</strong> : Cookies de session sécurisés avec attributs <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">SameSite=Lax</code> et <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">Secure</code> permettant de préserver votre authentification.
              </li>
              <li>
                <strong className="text-slate-800">mai_cookie_consent</strong> : Enregistre vos préférences de consentement conformément à la directive ePrivacy.
              </li>
            </ul>
          </section>

          {/* Section 6 : Conservation et Sécurité */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Database className="w-5 h-5 text-emerald-500" />
              6. Durée de Conservation &amp; Mesures de Sécurité
            </h2>
            <p className="leading-relaxed font-light text-sm">
              Vos données de compte sont conservées aussi longtemps que votre compte mAI demeure actif. En cas d'inactivité prolongée ou sur demande expresse de résiliation, vos données personnelles et clés API associées sont définitivement purgées de nos serveurs sous 30 jours. Les journaux techniques d'API sont automatiquement archivés puis détruits au terme d'une période de rotation glissante de 30 jours.
            </p>
          </section>

          {/* Section 7 : Vos Droits RGPD */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-purple-500" />
              7. Vos Droits sous le RGPD
            </h2>
            <p className="leading-relaxed font-light text-sm">
              Conformément à la réglementation européenne (articles 15 à 22 du RGPD), vous disposez des droits suivants concernant vos données :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/60 rounded-xl border border-slate-200 font-light">
                <strong className="text-slate-800 block mb-1">Droit d'accès &amp; Portabilité</strong>
                Consulter et exporter l'ensemble de vos données de profil et d'usage API à tout moment.
              </div>
              <div className="p-3 bg-white/60 rounded-xl border border-slate-200 font-light">
                <strong className="text-slate-800 block mb-1">Droit de Rectification &amp; Effacement</strong>
                Modifier vos informations de compte ou demander la suppression intégrale ("droit à l'oubli").
              </div>
              <div className="p-3 bg-white/60 rounded-xl border border-slate-200 font-light">
                <strong className="text-slate-800 block mb-1">Révocation des Clés d'API</strong>
                Désactiver ou régénérer instantanément vos identifiants d'API depuis votre console de gestion.
              </div>
              <div className="p-3 bg-white/60 rounded-xl border border-slate-200 font-light">
                <strong className="text-slate-800 block mb-1">Contact &amp; Réclamations</strong>
                Pour toute demande relative à vos données, contactez notre équipe via votre espace mAI ou déposez une réclamation auprès de l'autorité compétente (CNIL).
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}