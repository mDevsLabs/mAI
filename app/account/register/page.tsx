"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, Loader2, Globe } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { MaiApiError } from "@/lib/mai-api";
import toast from "react-hot-toast";

function RegisterForm() {
  const { register, verifyRegister, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState<"register" | "verify">("register");
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(next.startsWith("/") ? next : "/account");
    }
  }, [authLoading, isAuthenticated, next, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !username.trim() || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (username.trim().length < 3) {
      setError("Le nom d'utilisateur doit contenir au moins 3 caractères.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!acceptTerms) {
      const msg = "Vous devez accepter les Conditions Générales d'Utilisation et la Politique de Confidentialité pour continuer.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    try {
      const res = await register(email.trim(), username.trim(), password);
      if (res.status === "verification_required") {
        setStep("verify");
        toast.success("Code de vérification envoyé à votre adresse e-mail.");
      } else {
        toast.success("Compte créé avec succès");
        router.push(next.startsWith("/") ? next : "/account");
      }
    } catch (err) {
      const message =
        err instanceof MaiApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erreur lors de la création du compte.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!verificationCode.trim()) {
      setError("Veuillez renseigner le code de vérification.");
      return;
    }
    setSubmitting(true);
    try {
      await verifyRegister(email.trim(), username.trim(), password, verificationCode.trim());
      toast.success("Compte vérifié et créé avec succès");
      router.push(next.startsWith("/") ? next : "/account");
    } catch (err) {
      const message =
        err instanceof MaiApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Code de vérification invalide.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      const { resendVerificationCode } = await import("@/lib/mai-api");
      await resendVerificationCode({ email: email.trim(), action: "register" });
      toast.success("Nouveau code envoyé");
    } catch (err) {
      const message =
        err instanceof MaiApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erreur lors du renvoi du code.";
      toast.error(message);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-20 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Vérification
          </h1>
          <p className="text-slate-600 text-sm">
            Un code à 6 chiffres a été envoyé à <strong>{email}</strong>.
          </p>
        </div>

        <form
          onSubmit={handleVerify}
          className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4"
        >
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Code de vérification
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400 text-center tracking-widest font-mono text-lg"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Vérifier"
            )}
          </button>

          <p className="text-center text-sm text-slate-600 pt-2">
            Vous n'avez rien reçu ?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="text-purple-600 font-semibold hover:underline"
            >
              Renvoyer le code
            </button>
          </p>
          <p className="text-center text-sm text-slate-600">
            <button
              type="button"
              onClick={() => setStep("register")}
              className="text-slate-500 font-medium hover:underline"
            >
              Modifier mes informations
            </button>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          Créer un compte
        </h1>
        <p className="text-slate-600 text-sm">
          Un seul compte mAI pour accéder à tous vos projets et clés API.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4"
      >
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Adresse e-mail
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Nom d&apos;utilisateur
          </label>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ex. mathias"
            className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400"
            required
            minLength={3}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Mot de passe
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Au moins 6 caractères"
            className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400"
            required
          />
        </div>

        <div className="p-3.5 rounded-2xl bg-white/50 border border-slate-200/80 space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-purple-600 focus:ring-purple-500/30 focus:ring-2 cursor-pointer transition-all shrink-0 accent-purple-600"
              required
            />
            <span className="text-xs text-slate-700 leading-relaxed font-normal">
              J'ai lu et j'accepte les{" "}
              <Link
                href="/legal/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-purple-600 hover:text-purple-700 underline underline-offset-2 transition-colors"
              >
                Conditions Générales d'Utilisation
              </Link>{" "}
              et la{" "}
              <Link
                href="/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-purple-600 hover:text-purple-700 underline underline-offset-2 transition-colors"
              >
                Politique de Confidentialité
              </Link>
              . <span className="text-purple-600 font-bold">*</span>
            </span>
          </label>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pl-6.5 font-light">
            <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Stockage 100% dans l'UE 🇪🇺 &amp; requêtes d'API protégées (zéro réentraînement).</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          Créer mon compte
        </button>

        <p className="text-center text-sm text-slate-600 pt-2">
          Déjà un compte ?{" "}
          <Link
            href={`/account/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-purple-600 font-semibold hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
