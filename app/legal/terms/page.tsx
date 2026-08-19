"use client";

import { motion } from "motion/react";
import { FileText, ArrowLeft, ShieldAlert, Key, CheckCircle2, Zap, Scale } from "lucide-react";
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
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500">d'Utilisation</span> 📜
        </h1>

        <p className="text-slate-500 font-light mb-10 text-base md:text-lg">
          Dernière mise à jour : 1er août 2026. Bienvenue sur mAI. Les présentes Conditions Générales d'Utilisation (CGU) régissent votre accès et l'utilisation de nos plateformes, de nos services mAI, de notre Playground et des points de terminaison de l'API mAI.
        </p>

        <div className="space-y-8 text-slate-600">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-500" />
              1. Acceptation des Conditions
            </h2>
            <p className="leading-relaxed font-light">
              En créant un compte, en générant une clé API ou en accédant aux services mAI, vous acceptez sans réserve de vous conformer aux présentes conditions. Si vous n'acceptez pas l'ensemble de ces termes, vous ne devez pas utiliser nos API ni nos services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-500" />
              2. Utilisation des Clés API &amp; Quotas
            </h2>
            <p className="leading-relaxed font-light">
              <strong>Responsabilité des Clés API</strong> : Votre clé API mAI (format <code className="bg-purple-50 px-1.5 py-0.5 rounded text-purple-700 font-mono text-xs">mp-...</code>) est strictement personnelle et confidentielle. Vous êtes entièrement responsable de l'ensemble des activités et requêtes exécutées avec vos clés API.
            </p>

            <div className="space-y-2 pt-2">
              <p className="font-bold text-slate-900 text-sm">Règles d'Accès aux Modèles par Formule :</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm font-light">
                <li>
                  <strong className="text-slate-800">Compte Free (Gratuit)</strong> : Limité à 1 000 requêtes mensuelles. Les requêtes sur <code className="bg-slate-100 px-1 rounded font-mono text-xs">/v1/chat/completions</code> sont autorisées uniquement sur les modèles comportant la mention <code className="text-purple-600 font-bold">:free</code> dans leur nom. Toute tentative d'appel d'un modèle non-gratuit entraînera une réponse <strong className="text-red-600 font-bold">403 Forbidden</strong>.
                </li>
                <li>
                  <strong className="text-purple-700">Comptes Plus, Pro &amp; Max</strong> : Bénéficient d'un accès illimité à l'intégralité du catalogue de modèles (locaux mAI et modèles Cloud OpenAI/Anthropic/Google/DeepSeek/Qwen) dans la limite de leurs quotas mensuels (5 000, 25 000 et 100 000 requêtes/mois respectivement).
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              3. Usage Interdit &amp; Sécurité
            </h2>
            <p className="leading-relaxed font-light">
              Il est strictement interdit d'utiliser les services mAI pour :
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-4 text-sm font-light">
              <li>Tenter de contourner les limites de quota ou de partager sa clé API de manière illégale</li>
              <li>Exécuter des attaques par déni de service (DDoS) ou perturber la stabilité de nos serveurs</li>
              <li>Générer du contenu illégal, haineux, malveillant ou enfreignant les droits d'auteur</li>
              <li>Revendre l'accès à l'API sans autorisation écrite préalable de mDevsLabs</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-500" />
              4. Disponibilité &amp; Limites de Garantie
            </h2>
            <p className="leading-relaxed font-light">
              Nous nous efforçons de maintenir un taux de disponibilité supérieur à 99,9% sur l'API mAI. Cependant, les services sont fournis « en l'état ». mDevsLabs ne saurait être tenu responsable des interruptions temporaires dues à la maintenance des serveurs ou à des pannes d'infrastructure tierces.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              5. Modification des CGU
            </h2>
            <p className="leading-relaxed font-light">
              mDevsLabs se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront informés de toute mise à jour majeure par notification sur la plateforme ou par e-mail.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}