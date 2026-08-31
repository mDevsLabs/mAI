"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Loader2, ShieldBan, Mail } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { MaiApiError } from "@/lib/mai-api";
import toast from "react-hot-toast";

function LoginForm() {
  const { login, verifyLogin, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const [step, setStep] = useState<"login" | "verify">("login");
  const [targetEmail, setTargetEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(next.startsWith("/") ? next : "/account");
    }
  }, [authLoading, isAuthenticated, next, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsBlocked(false);
    if (!email.trim() || !password) {
      setError("Veuillez renseigner votre identifiant et le mot de passe.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      if (res.status === "verification_required") {
        setTargetEmail(res.email || email.trim());
        setStep("verify");
        toast.success("Code de vérification envoyé à votre adresse e-mail.");
      } else {
        // Fallback pour les anciens comptes
        toast.success("Connexion réussie");
        router.push(next.startsWith("/") ? next : "/account");
      }
    } catch (err) {
      const message =
        err instanceof MaiApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erreur de connexion.";
      // Compte bloqué par un administrateur (403 + flag blocked)
      if (err instanceof MaiApiError && err.status === 403) {
        setIsBlocked(true);
      }
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsBlocked(false);
    if (!verificationCode.trim()) {
      setError("Veuillez renseigner le code de vérification.");
      return;
    }
    setSubmitting(true);
    try {
      await verifyLogin(targetEmail, verificationCode.trim());
      toast.success("Connexion réussie");
      router.push(next.startsWith("/") ? next : "/account");
    } catch (err) {
      const message =
        err instanceof MaiApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Code de vérification invalide.";
      // Compte bloqué par un administrateur (403 + flag blocked)
      if (err instanceof MaiApiError && err.status === 403) {
        setIsBlocked(true);
      }
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      const { resendVerificationCode } = await import("@/lib/mai-api");
      await resendVerificationCode({ email: targetEmail, action: "login" });
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
            Un code à 6 chiffres a été envoyé à <strong>{targetEmail}</strong>.
          </p>
        </div>

        <form
          onSubmit={handleVerify}
          className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4"
        >
          {isBlocked && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldBan className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm font-medium">
                  Votre compte est actuellement <strong>bloqué</strong>. Il n'est
                  donc pas possible de se connecter. Pour demander sa
                  réactivation, vous pouvez rédiger un mail au support.
                </div>
              </div>
              <a
                href={`mailto:mprojectsofficiel@gmail.com?subject=${encodeURIComponent(
                  "Demande de réactivation de compte bloqué"
                )}&body=${encodeURIComponent(
                  `Bonjour,\n\nMon compte (${targetEmail}) a été bloqué. Je souhaite demander sa réactivation.\n\nCordialement,`
                )}`}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Rédiger un mail de demande
              </a>
            </div>
          )}

          {error && !isBlocked && (
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
              onClick={() => setStep("login")}
              className="text-slate-500 font-medium hover:underline"
            >
              Retour à la connexion
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
          Se connecter
        </h1>
        <p className="text-slate-600 text-sm">
          Accédez à votre compte mAI unifié (Web, Pulse, CLI, Coder).
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4"
      >
        {isBlocked && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldBan className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">
                Votre compte est actuellement <strong>bloqué</strong>. Il n'est
                donc pas possible de se connecter. Pour demander sa
                réactivation, vous pouvez rédiger un mail au support.
              </div>
            </div>
            <a
              href={`mailto:mprojectsofficiel@gmail.com?subject=${encodeURIComponent(
                "Demande de réactivation de compte bloqué"
              )}&body=${encodeURIComponent(
                `Bonjour,\n\nMon compte (${email.trim()}) a été bloqué. Je souhaite demander sa réactivation.\n\nCordialement,`
              )}`}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Rédiger un mail de demande
            </a>
          </div>
        )}

        {error && !isBlocked && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Identifiant (e-mail, numéro de téléphone ou nom d'utilisateur)
          </label>
          <input
            type="text"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e-mail, +33612345678 ou pseudo"
            className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Mot de passe
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400"
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
            <LogIn className="w-4 h-4" />
          )}
          Se connecter
        </button>

        <p className="text-center text-sm text-slate-600 pt-2">
          Pas encore de compte ?{" "}
          <Link
            href={`/account/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-purple-600 font-semibold hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
