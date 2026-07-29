"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LogOut,
  Mail,
  User,
  Sparkles,
  Gauge,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { MaiApiError } from "@/lib/mai-api";
import toast from "react-hot-toast";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
  return String(n);
}

function formatResetDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function AccountPage() {
  const {
    user,
    usage,
    loading,
    isAuthenticated,
    logout,
    refreshUsage,
    verifyUpgradeCode,
  } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/account/login");
    }
  }, [loading, isAuthenticated, router]);

  const percent = useMemo(() => {
    if (!usage || !usage.limit) return 0;
    return Math.min(100, Math.round((usage.tokensUsed / usage.limit) * 100));
  }, [usage]);

  const handleLogout = () => {
    logout();
    toast.success("Déconnecté");
    router.push("/account/login");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await refreshUsage();
      if (data) toast.success("Quota actualisé");
      else toast.error("Session expirée");
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpgrade = async (e: FormEvent) => {
    e.preventDefault();
    setCodeError("");
    if (!code.trim()) {
      setCodeError("Saisissez un code.");
      return;
    }
    setUpgrading(true);
    try {
      const tier = await verifyUpgradeCode(code.trim());
      setCode("");
      toast.success(`Compte passé en ${tier}`);
    } catch (err) {
      const message =
        err instanceof MaiApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Code invalide.";
      setCodeError(message);
      toast.error(message);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="flex justify-center py-20 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Mon compte
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Compte mAI unifié — mProjects &amp; projets mDevsLabs
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>

      {/* Profil */}
      <section className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center text-lg font-bold shadow-md">
            {(user.username || user.email)
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{user.username}</p>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            {user.tier || "Free"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="rounded-2xl bg-white/50 border border-slate-200/60 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Identifiant
            </p>
            <p className="font-semibold text-slate-900">{user.username}</p>
          </div>
          <div className="rounded-2xl bg-white/50 border border-slate-200/60 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Forfait
            </p>
            <p className="font-semibold text-slate-900">{user.tier || "Free"}</p>
          </div>
        </div>
      </section>

      {/* Usage mAI */}
      <section className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-purple-600" />
            Usage mAI (hebdomadaire)
          </h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-200 hover:bg-white/80 text-slate-600 transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {usage ? (
          <>
            <div className="flex items-end justify-between text-sm">
              <p className="text-slate-600">
                <span className="font-bold text-slate-900">
                  {formatTokens(usage.tokensUsed)}
                </span>{" "}
                / {formatTokens(usage.limit)} tokens
              </p>
              <p className="font-semibold text-slate-900">{percent}%</p>
            </div>
            <div className="h-3 rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percent >= 90
                    ? "bg-red-500"
                    : percent >= 70
                      ? "bg-amber-500"
                      : "bg-gradient-to-r from-purple-500 to-blue-500"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Réinitialisation : {formatResetDate(usage.resetAt)}
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            Impossible de charger le quota. Réessayez.
          </p>
        )}
      </section>

      {/* Upgrade code */}
      <section className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-purple-600" />
          Code d&apos;upgrade
        </h2>
        <p className="text-sm text-slate-600">
          Saisissez un code Plus, Pro ou Max pour augmenter votre forfait mAI.
        </p>
        <form onSubmit={handleUpgrade} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="CODE-XXXX"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/60 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400 uppercase tracking-wider"
          />
          <button
            type="submit"
            disabled={upgrading}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            {upgrading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Activer
          </button>
        </form>
        {codeError && (
          <p className="text-sm text-red-600 font-medium">{codeError}</p>
        )}
      </section>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/api"
          className="px-4 py-2 rounded-full border border-black/10 bg-white/50 hover:bg-white/80 text-slate-700 font-medium transition-colors"
        >
          Clés API
        </Link>
        <Link
          href="/projects/mai-cli"
          className="px-4 py-2 rounded-full border border-black/10 bg-white/50 hover:bg-white/80 text-slate-700 font-medium transition-colors"
        >
          mAI CLI
        </Link>
        <Link
          href="/news"
          className="px-4 py-2 rounded-full border border-black/10 bg-white/50 hover:bg-white/80 text-slate-700 font-medium transition-colors"
        >
          Actualités
        </Link>
      </div>
    </div>
  );
}
