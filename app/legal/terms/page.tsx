"use client";

import { motion } from "motion/react";
import {
  FileText,
  ArrowLeft,
  ShieldAlert,
  Key,
  CheckCircle2,
  Zap,
  Scale,
  Globe,
  Cpu,
  Ban,
} from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
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
          <Scale className="w-8 h-8" />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900 mb-6">
          Conditions Générales <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500">
            d'Utilisation
          </span>{" "}
          📜
        </h1>

        <p className="text-slate-500 font-light mb-8 text-base md:text-lg">
          Dernière mise à jour : 23 août 2026. Bienvenue sur <strong>mAI</strong>, une plateforme conçue et opérée par <strong>mDevsLabs</strong>. Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès, l'inscription et l'exploitation des services mAI, des modèles d'intelligence artificielle, du stockage Cloud et de l'API mAI.
        </p>

        {/* Bannière récapitulative des piliers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 text-xs">
          <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200/80 text-purple-950 font-medium flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
            <span>Consentement éclairé et adhésion obligatoire aux CGU</span>
          </div>
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-emerald-950 font-medium flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Stockage 100% dans l'Union Européenne (UE)</span>
          </div>
          <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200/80 text-blue-950 font-medium flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-blue-600 shrink-0" />
            <span>API mAI transparente et zéro réentraînement</span>
          </div>
        </div>

        <div className="space-y-10 text-slate-600">
          {/* Section 1 : Acceptation des Conditions */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-purple-500" />
              1. Acceptation des Conditions &amp; Création de Compte
            </h2>
            <p className="leading-relaxed font-light">
              La création d'un compte utilisateur sur mAI, l'obtention d'une clé API ou l'interaction avec nos services implique l'acceptation expresse et sans réserve des présentes conditions. L'utilisateur confirme être âgé d'au moins 15 ans ou détenir l'autorisation légale nécessaire. Si vous n'acceptez pas l'ensemble de ces termes, vous devez vous abstenir d'utiliser notre plateforme et nos API.
            </p>
          </section>

          {/* Section 2 : Stockage et Traitement dans l'Union Européenne */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-emerald-600" />
              2. Stockage des Données dans l'Union Européenne (UE) 🇪🇺
            </h2>
            <p className="leading-relaxed font-light">
              mDevsLabs s'engage contractuellement à respecter les normes européennes les plus strictes en matière de protection des données :
            </p>
            <div className="space-y-2.5 pt-1 text-sm font-light">
              <div className="p-3.5 bg-white/70 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-xs uppercase tracking-wider block">📍 Localisation des Datacenters :</strong>
                <p className="text-slate-600 text-xs leading-relaxed">
                  L'ensemble des bases de données relationnelles, métadonnées, clés de chiffrement et fichiers hébergés sur le service de Cloud Storage mAI sont situés dans des centres de données physiques implantés au sein de l'Union Européenne (région EU, notamment Francfort, Allemagne).
                </p>
              </div>
              <div className="p-3.5 bg-white/70 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-xs uppercase tracking-wider block">⚖️ Souveraineté &amp; Conformité RGPD :</strong>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Vos données sont régies par le Règlement Général sur la Protection des Données (RGPD 2016/679). Aucun transfert non autorisé vers des juridictions tierces ne sera opéré sans votre accord préalable explicite.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 : Utilisation des Clés API & Quotas */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Key className="w-5 h-5 text-blue-500" />
              3. Utilisation de l'API mAI, Clés d'Accès &amp; Quotas
            </h2>
            <p className="leading-relaxed font-light">
              <strong>Clés API Sécurisées</strong> : Chaque clé API (format <code className="bg-purple-50 px-1.5 py-0.5 rounded text-purple-700 font-mono text-xs">mai-...</code> / <code className="bg-purple-50 px-1.5 py-0.5 rounded text-purple-700 font-mono text-xs">mp-...</code>) est strictement confidentielle. Vous êtes juridiquement responsable de l'ensemble des requêtes effectuées avec vos identifiants d'API. En cas de compromission, vous devez révoquer votre clé immédiatement depuis votre espace client.
            </p>

            <div className="space-y-3 pt-2">
              <p className="font-bold text-slate-900 text-sm">Gestion des Forfaits &amp; Accès aux Modèles :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/70 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-900 block">Compte Free (Gratuit)</span>
                  <span className="text-slate-600 mt-1 block">1 000 requêtes / mois. Les appels à l'API <code className="bg-slate-100 px-1 rounded font-mono text-[11px]">/v1/chat/completions</code> sont autorisés exclusivement sur les modèles comportant l'extension <code className="text-purple-600 font-bold">:free</code>. Toute tentative d'appel d'un modèle restreint renvoie une réponse <strong>403 Forbidden</strong>.</span>
                </div>
                <div className="p-3 bg-white/70 rounded-2xl border border-slate-200">
                  <span className="font-bold text-purple-700 block">Comptes Plus, Pro &amp; Max</span>
                  <span className="text-slate-600 mt-1 block">Accès complet à tous les modèles (locaux mAI et modèles Cloud partenaires) dans la limite des quotas alloués (5 000, 25 000 et 100 000 requêtes/mois). Débits de requêtes prioritaires et bande passante dédiée.</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-slate-700 text-xs space-y-1.5 font-light">
              <strong className="text-purple-900 block font-bold">🔒 Politique Zéro Réentraînement API :</strong>
              <p>
                mDevsLabs garantit que vos invites (prompts), données métier, documents injectés et résultats générés via l'API mAI <strong>ne sont jamais utilisés pour entraîner nos modèles d'IA</strong>. Vos données restent strictement confidentielles et vous appartiennent.
              </p>
            </div>
          </section>

          {/* Section 4 : Usage Interdit & Sécurité */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              4. Usages Interdits &amp; Politique de Bonne Conduite (AUP)
            </h2>
            <p className="leading-relaxed font-light">
              L'accès à l'API et aux services mAI est conditionné au respect des règles de bonne conduite. Sont expressément prohibés :
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-4 text-sm font-light">
              <li>Le contournement des mécanismes de quota, de facturation ou de limitation de débit (Rate Limiting)</li>
              <li>La revente, redistribution ou sous-location non autorisée de clés API</li>
              <li>L'exécution d'attaques par déni de service (DDoS), de scan de vulnérabilités ou d'extraction forcée de données</li>
              <li>La génération ou diffusion de contenus malveillants, haineux, diffamatoires ou enfreignant des droits de propriété intellectuelle tiers</li>
              <li>L'utilisation de l'API pour des activités illégales ou frauduleuses</li>
            </ul>
          </section>

          {/* Section 5 : Propriété Intellectuelle */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-blue-500" />
              5. Propriété Intellectuelle &amp; Données Générées
            </h2>
            <p className="leading-relaxed font-light text-sm">
              <strong>Contenus Utilisateur</strong> : Vous conservez tous les droits de propriété intellectuelle sur les textes, données et fichiers que vous soumettez à l'API mAI ainsi que sur les résultats générés, sous réserve du respect des lois applicables.
            </p>
            <p className="leading-relaxed font-light text-sm mt-2">
              <strong>Plateforme &amp; Marques</strong> : Tous les éléments composant la plateforme mAI (codes sources, marques mDevsLabs / mAI, interfaces, architectures et documentations) demeurent la propriété exclusive de mDevsLabs.
            </p>
          </section>

          {/* Section 6 : Disponibilité & Garantie */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-emerald-500" />
              6. Disponibilité des Services &amp; Responsabilité
            </h2>
            <p className="leading-relaxed font-light text-sm">
              Nous mettons en œuvre tous les moyens raisonnables pour assurer une disponibilité continue de l'API mAI (objectif de 99,9%). Toutefois, mDevsLabs ne pourra être tenue pour responsable des éventuelles interruptions de service nécessaires pour la maintenance technique, les mises à jour de sécurité ou résultant de pannes de réseaux tiers. Les services sont fournis « en l'état ».
            </p>
          </section>

          {/* Section 7 : Suspension et Résiliation */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Ban className="w-5 h-5 text-red-500" />
              7. Suspension et Résiliation
            </h2>
            <p className="leading-relaxed font-light text-sm">
              Vous pouvez résilier votre compte mAI à tout moment via les paramètres de votre profil. mDevsLabs se réserve le droit de révoquer immédiatement une clé API ou de suspendre un compte en cas d'abus caractérisé, de non-respect des présentes CGU ou d'activité présentant un risque pour la sécurité de l'infrastructure.
            </p>
          </section>

          {/* Section 8 : Droit Applicable & Modifications */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-purple-500" />
              8. Modification des CGU &amp; Juridiction Compétente
            </h2>
            <p className="leading-relaxed font-light text-sm">
              mDevsLabs se réserve le droit d'actualiser les présentes CGU pour refléter les évolutions techniques ou légales. Les utilisateurs seront informés par notification ou par e-mail en cas de révision substantielle. Les présentes conditions sont soumises au <strong>droit français et européen</strong>. En cas de litige, les tribunaux compétents seront ceux du ressort de la juridiction compétente.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}