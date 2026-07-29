"use client";

import { FormEvent, useEffect, useMemo, useState, useRef } from "react";
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
  Camera,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { MaiApiError } from "@/lib/mai-api";
import { getUserApiUsage } from "@/app/actions/api-keys";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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
    updateProfile,
    uploadAvatar,
  } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Formulaires d'édition du profil
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  
  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Stats d'utilisation des clés API (Neon)
  const [apiUsageStats, setApiUsageStats] = useState<{key: string, plan: string, requestCount: number, limit: number}[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/account/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.username) {
      setNewUsername(user.username);
    }
  }, [user?.username]);

  const percent = useMemo(() => {
    if (!usage || !usage.limit) return 0;
    return Math.min(100, Math.round((usage.tokensUsed / usage.limit) * 100));
  }, [usage]);

  const loadApiUsage = async () => {
    if (!user) return;
    const userId = user.username || user.email || "anonymous";
    const res = await getUserApiUsage(userId);
    if (res.success && res.keys) {
      setApiUsageStats(res.keys.map(k => ({
        key: k.key.substring(0, 8) + "...",
        plan: k.plan,
        requestCount: k.requestCount,
        limit: k.plan === "Max" ? 5000 : k.plan === "Pro" ? 2000 : k.plan === "Plus" ? 1000 : 500
      })));
    }
  };

  useEffect(() => {
    if (user) {
      loadApiUsage();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success("Déconnecté");
    router.push("/account/login");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await refreshUsage();
      await loadApiUsage(); // Refresh API keys usage too
      if (data) toast.success("Quota actualisé");
      else toast.error("Session expirée");
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() && !newPassword.trim()) {
      toast.error("Veuillez remplir au moins un champ à modifier.");
      return;
    }
    setUpdatingProfile(true);
    try {
      await updateProfile({
        ...(newUsername.trim() !== user?.username ? { username: newUsername.trim() } : {}),
        ...(newPassword.trim() ? { password: newPassword.trim() } : {}),
      });
      setNewPassword("");
      toast.success("Profil mis à jour avec succès ! ✨");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour du profil.");
    } finally {
      setUpdatingProfile(false);
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo.");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide.");
      return;
    }

    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      toast.success("Avatar mis à jour !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'upload de l'avatar.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="flex justify-center py-20 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // Quotas selon le forfait utilisateur (Free: 500, Plus: 1000, Pro: 2000, Max: 5000)
  const getTierQuotaLabel = (tierStr?: string) => {
    const t = (tierStr || "Free").toLowerCase();
    if (t === "plus") return "1 000 requêtes / mois";
    if (t === "pro") return "2 000 requêtes / mois";
    if (t === "max") return "5 000 requêtes / mois";
    return "500 requêtes / mois";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Mon compte mAI
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Gérez vos informations personnelles, forfaits et quotas d&apos;API.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>

      {/* Modification de profil */}
      <section className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600" /> Modifier mon profil
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nouveau nom d&apos;utilisateur</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Mon pseudo"
                className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nouveau mot de passe (optionnel)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6+ caractères"
                className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {updatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </section>

      {/* Forfaits & Quotas (Profil header) */}
      <section className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-md cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-purple-500 hover:ring-offset-2 ${
                user.avatarUrl ? "bg-white" : "bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-500 text-white"
              }`}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover bg-white" />
              ) : (
                (user.username || user.email).slice(0, 2).toUpperCase()
              )}
              
              {/* Overlay Hover / Loading */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${uploadingAvatar ? "bg-black/60 opacity-100 backdrop-blur-sm" : "bg-black/40 opacity-0 group-hover:opacity-100"}`}>
                {uploadingAvatar ? (
                  <div className="flex flex-col items-center gap-1">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  </div>
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.username}</h2>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-4 h-4 text-purple-600" />
              {user.email}
            </p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-purple-600" />
            {user.tier || "Free"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-2xl bg-white/60 border border-slate-200/80 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-600" /> Nom d&apos;utilisateur
            </p>
            <p className="font-bold text-slate-900 text-base">{user.username}</p>
          </div>
          <div className="rounded-2xl bg-white/60 border border-slate-200/80 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Quota API Réglé
            </p>
            <p className="font-bold text-slate-900 text-base">{getTierQuotaLabel(user.tier)}</p>
          </div>
        </div>
      </section>

      {/* Usage API */}
      <section className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-purple-600" />
            Usage API (Toutes clés confondues)
          </h2>
        </div>

        {apiUsageStats.length > 0 ? (
          <div className="space-y-6 pt-2">
            {(() => {
              // Calcul de l'usage global (toutes les clés confondues)
              const totalRequests = apiUsageStats.reduce((acc, curr) => acc + curr.requestCount, 0);
              // La limite globale du compte est la limite du forfait de la première clé (qui est liée à l'utilisateur)
              const globalLimit = apiUsageStats[0]?.limit || 500;
              const percent = Math.min(100, (totalRequests / globalLimit) * 100);

              return (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700 font-bold">Requêtes API globales</span>
                    <span className="text-slate-900 font-medium">
                      {totalRequests.toLocaleString()} / {globalLimit.toLocaleString()} requêtes
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        percent > 90 ? 'bg-red-500' : 'bg-purple-500'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Le quota de requêtes est appliqué au niveau de votre compte et partagé entre toutes vos clés.
                  </p>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500">Aucune clé API active pour l'instant.</p>
            <Link
              href="/api"
              className="mt-4 inline-flex px-4 py-2 text-sm text-purple-600 font-medium bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              Gérer mes clés API
            </Link>
          </div>
        )}
      </section>

      

      {/* Usage mAI */}
      <section className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-purple-600" />
            Usage mAI
          </h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-200 hover:bg-white/80 text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
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
              Réinitialisation hebdomadaire : {formatResetDate(usage.resetAt)}
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            Impossible de charger le quota. Réessayez.
          </p>
        )}
      </section>

      {/* Tableau récapitulatif des forfaits */}
      <section className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Rappel des Forfaits &amp; Quotas API
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className={`p-4 rounded-2xl border ${user.tier?.toLowerCase() === "free" ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20" : "bg-white/50 border-slate-200"}`}>
            <p className="font-bold text-slate-900 text-sm">Free</p>
            <p className="text-purple-700 font-extrabold text-base mt-1">500</p>
            <p className="text-slate-500 text-[11px]">req / mois</p>
          </div>
          <div className={`p-4 rounded-2xl border ${user.tier?.toLowerCase() === "plus" ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20" : "bg-white/50 border-slate-200"}`}>
            <p className="font-bold text-slate-900 text-sm">Plus</p>
            <p className="text-purple-700 font-extrabold text-base mt-1">1 500</p>
            <p className="text-slate-500 text-[11px]">req / mois</p>
          </div>
          <div className={`p-4 rounded-2xl border ${user.tier?.toLowerCase() === "pro" ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20" : "bg-white/50 border-slate-200"}`}>
            <p className="font-bold text-slate-900 text-sm">Pro</p>
            <p className="text-purple-700 font-extrabold text-base mt-1">5 000</p>
            <p className="text-slate-500 text-[11px]">req / mois</p>
          </div>
          <div className={`p-4 rounded-2xl border ${user.tier?.toLowerCase() === "max" ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20" : "bg-white/50 border-slate-200"}`}>
            <p className="font-bold text-slate-900 text-sm">Max</p>
            <p className="text-purple-700 font-extrabold text-base mt-1">Illimité</p>
            <p className="text-slate-500 text-[11px]">req / mois</p>
          </div>
        </div>
      </section>

      {/* Upgrade code */}
      <section className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-purple-600" />
          Activer un Code d&apos;Upgrade
        </h2>
        <p className="text-sm text-slate-600">
          Saisissez un code d&apos;accès Plus, Pro ou Max pour augmenter votre forfait mAI.
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
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
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

    </div>
  );
}
