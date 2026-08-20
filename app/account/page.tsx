"use client";

// Client component for Account Page

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
  Phone,
  Lock,
  Monitor,
  Cloud,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { MaiApiError, formatStorageBytes, CLOUD_STORAGE_LIMITS } from "@/lib/mai-api";
import { getUserApiUsage } from "@/app/actions/api-keys";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { DevicesList } from "@/components/account/devices-list";

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

function getMonthlyResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  return nextMonth.toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AccountPage() {
  const {
    user,
    usage,
    cloudStorage,
    loading,
    isAuthenticated,
    logout,
    refreshUsage,
    refreshCloudStorage,
    verifyUpgradeCode,
    updateProfile,
    uploadAvatar,
  } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingApi, setRefreshingApi] = useState(false);
  const [refreshingStorage, setRefreshingStorage] = useState(false);

  // Formulaires d'édition du profil
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [notifyLimits, setNotifyLimits] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  
  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Effets de récompense pour l'upgrade
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRocket, setShowRocket] = useState(false);
  const [upgradedTier, setUpgradedTier] = useState<string | null>(null);
  const { width, height } = useWindowSize();

  // Active section for Scroll Spy
  const [activeSection, setActiveSection] = useState("profil");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["profil", "usage-api", "usage-mai", "usage-cloud", "appareils", "upgrade-code"];
      let current = sections[0];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Stats d'utilisation des clés API (Neon)
  const [apiUsageStats, setApiUsageStats] = useState<{key: string, plan: string, requestCount: number, limit: number}[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/account/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      if (user.username) setNewUsername(user.username);
      if (user.email) setNewEmail(user.email);
      if (user.phone) setNewPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (usage) {
      if (usage.newsletter !== undefined) setNewsletter(usage.newsletter);
      if (usage.notify_limits !== undefined) setNotifyLimits(usage.notify_limits);
    }
  }, [usage]);

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
      await refreshCloudStorage();
      if (data) toast.success("Quotas actualisés");
      else toast.error("Session expirée");
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefreshStorage = async () => {
    setRefreshingStorage(true);
    try {
      const data = await refreshCloudStorage();
      if (data) toast.success("Quota de stockage actualisé");
      else toast.error("Erreur lors de l'actualisation du stockage");
    } catch {
      toast.error("Erreur serveur lors du rafraîchissement.");
    } finally {
      setRefreshingStorage(false);
    }
  };

  const handleRefreshApiUsage = async () => {
    setRefreshingApi(true);
    try {
      await loadApiUsage();
      await refreshUsage();
      toast.success("Usage API actualisé !");
    } catch {
      toast.error("Erreur lors de l'actualisation de l'usage API.");
    } finally {
      setRefreshingApi(false);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      toast.error("Veuillez saisir votre mot de passe actuel pour valider les modifications.");
      return;
    }
    setUpdatingProfile(true);
    try {
      await updateProfile({
        currentPassword: currentPassword.trim(),
        ...(newUsername.trim() !== user?.username ? { username: newUsername.trim() } : {}),
        ...(newEmail.trim() !== user?.email ? { email: newEmail.trim() } : {}),
        ...(newPhone.trim() !== (user?.phone || "") ? { phone: newPhone.trim() } : {}),
        ...(newPassword.trim() ? { password: newPassword.trim() } : {}),
        newsletter: newsletter,
        notify_limits: notifyLimits,
      });
      setNewPassword("");
      setCurrentPassword("");
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
      setUpgradedTier(tier);
      setShowConfetti(true);
      setShowRocket(true);

      // Son de succès
      const audio = new Audio('/sounds/plan-update.mp3');
      audio.play().catch(() => {});

      await loadApiUsage();

      // Toast personnalisé
      toast.custom(
        (_t: any) => (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              <div>
                <p className="font-bold">🎉 Félicitations !</p>
                <p className="text-sm">Forfait <span className="font-black">{tier}</span> activé ! ✨</p>
              </div>
            </div>
          </motion.div>
        ),
        { duration: 5000 }
      );

      // Arrêt des animations après 5s
      setTimeout(() => {
        setShowConfetti(false);
        setShowRocket(false);
        setUpgradedTier(null);
      }, 5000);

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
  const getTierQuotaLimit = (tierStr?: string) => {
    const t = (tierStr || "Free").toLowerCase().trim();
    if (t === "plus") return 1000;
    if (t === "pro") return 2000;
    if (t === "max") return 5000;
    return 500;
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="sticky top-24 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {[
              { id: "profil", label: "Profil & Paramètres", icon: User },
              { id: "usage-api", label: "Usage API", icon: KeyRound },
              { id: "usage-mai", label: "Usage mAI", icon: Gauge },
              { id: "usage-cloud", label: "Stockage Cloud", icon: Cloud },
              { id: "appareils", label: "Appareils Connectés", icon: Monitor },
              { id: "upgrade-code", label: "Activer un Code", icon: Sparkles },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeSection === item.id
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white/40 text-slate-600 hover:bg-white border border-slate-200/50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 space-y-8">
          {/* Confettis */}
          {showConfetti && (
            <Confetti
              width={width}
              height={height}
              colors={['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B']}
              numberOfPieces={200}
              gravity={0.15}
              tweenDuration={5000}
            />
          )}

          {/* Fusée */}
          {showRocket && (
            <motion.div
              initial={{ x: -50, y: height / 2, opacity: 0, scale: 0.5 }}
              animate={{ x: width + 50, y: height / 2, opacity: 1, scale: 1 }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="fixed z-50 pointer-events-none"
            >
              <div className="relative">
                <motion.div
                  className="w-16 h-24 bg-gradient-to-b from-orange-400 to-red-500 rounded-t-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-8 h-12"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scaleY: [0.8, 1.2, 0.8],
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <div className="w-full h-full bg-gradient-to-t from-orange-500 to-transparent rounded-full" />
                </motion.div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-300 rounded-full border-2 border-white" />
              </div>
            </motion.div>
          )}

          {/* Section Profil unifiée : présentation + modification */}
          <section id="profil" className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-6">

        {/* --- Présentation du profil (en haut) --- */}
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
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${uploadingAvatar ? "bg-black/60 opacity-100 backdrop-blur-sm" : "bg-black/40 opacity-0 group-hover:opacity-100"}`}>
                {uploadingAvatar ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/60 border border-slate-200/80 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-600" /> Nom d&apos;utilisateur
            </p>
            <p className="font-bold text-slate-900 text-base">{user.username}</p>
          </div>
          <div className="rounded-2xl bg-white/60 border border-slate-200/80 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-purple-600" /> Téléphone
            </p>
            <p className="font-bold text-slate-900 text-base">{user.phone || "Non renseigné"}</p>
          </div>
          <Link href="/pricing" className={`rounded-2xl bg-white/60 border border-slate-200/80 p-4 shadow-sm transition-all duration-300 hover:border-purple-300 hover:shadow-md cursor-pointer block ${
            upgradedTier === user.tier ? "ring-4 ring-purple-500/50 shadow-purple-500/30" : ""
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 ${
                  upgradedTier === user.tier ? "text-purple-500 animate-pulse" : "text-purple-600"
                }`} /> Abonnement
              </p>
              <span className="text-[10px] text-purple-600 font-bold hover:underline">Voir les offres →</span>
            </div>
            <motion.p
              className="font-bold text-slate-900 text-base"
              animate={upgradedTier === user.tier ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {user.tier || "Free"}
            </motion.p>
          </Link>
        </div>

        {/* --- Séparateur --- */}
        <div className="border-t border-slate-200/60" />

        {/* --- Formulaire de modification (en bas) --- */}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600" /> Modifier mon profil
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nom d&apos;utilisateur</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Mon pseudo"
                className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Adresse e-mail</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="mon.email@exemple.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Numéro de téléphone</label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+33612345678"
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

          {/* Préférences e-mail */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Préférences e-mail</h4>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white peer-checked:bg-purple-600 peer-checked:border-purple-600 transition-colors group-hover:border-purple-500 flex items-center justify-center">
                    <svg className={`w-3 h-3 text-white fill-current opacity-0 peer-checked:opacity-100 transition-opacity`} viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">S'inscrire à la newsletter</p>
                  <p className="text-xs text-slate-500">Recevoir les actualités mAI et les mises à jour importantes.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={notifyLimits}
                    onChange={(e) => setNotifyLimits(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white peer-checked:bg-purple-600 peer-checked:border-purple-600 transition-colors group-hover:border-purple-500 flex items-center justify-center">
                    <svg className={`w-3 h-3 text-white fill-current opacity-0 peer-checked:opacity-100 transition-opacity`} viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">M'avertir des limites de quota</p>
                  <p className="text-xs text-slate-500">Recevoir un e-mail lorsque mes quotas API sont proches d'être atteints ou réinitialisés.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60">
            <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-red-500" />
              Mot de passe actuel <span className="text-red-500 font-normal">(Obligatoire pour enregistrer)</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Saisissez votre mot de passe actuel"
              className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl bg-white/80 border border-red-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 text-slate-900"
              required
            />
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

      {/* Usage API */}
      <section id="usage-api" className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-purple-600" />
            Usage API
          </h2>
          <button
            onClick={handleRefreshApiUsage}
            disabled={refreshingApi}
            className="p-2 rounded-xl border border-slate-200 hover:bg-white/80 text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${refreshingApi ? "animate-spin" : ""}`} />
          </button>
        </div>

        {apiUsageStats.length > 0 ? (
          <div className="space-y-6 pt-2">
            {(() => {
              // Calcul de l'usage global (toutes les clés confondues)
              const totalRequests = apiUsageStats.reduce((acc, curr) => acc + curr.requestCount, 0);
              // La limite globale du compte s'appuie directement sur le forfait de l'utilisateur
              const globalLimit = getTierQuotaLimit(user?.tier);
              const percent = Math.min(100, Math.round((totalRequests / globalLimit) * 100));

              return (
                <div className="space-y-2">
                  <div className="flex items-end justify-between text-sm">
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-900">
                        {totalRequests.toLocaleString()}
                      </span>{" "}
                      / {globalLimit.toLocaleString()} requêtes
                    </p>
                    <p className="font-semibold text-slate-900">{percent}%</p>
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
                    Réinitialisation mensuelle : {getMonthlyResetDate()}
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
      <section id="usage-mai" className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4">
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

      {/* Stockage Cloud */}
      <section id="usage-cloud" className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-purple-600" />
              Stockage Cloud
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consommation de votre espace de stockage Cloud mAI et fichiers hébergés.
            </p>
          </div>
          <button
            onClick={handleRefreshStorage}
            disabled={refreshingStorage}
            className="p-2 rounded-xl border border-slate-200 hover:bg-white/80 text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
            title="Actualiser le stockage"
          >
            <RefreshCw className={`w-4 h-4 ${refreshingStorage ? "animate-spin" : ""}`} />
          </button>
        </div>

        {(() => {
          const tier = user?.tier || "Free";
          const storageLimit = CLOUD_STORAGE_LIMITS[tier] || CLOUD_STORAGE_LIMITS["Free"];
          const storageUsed = cloudStorage?.bytes_used ?? 0;
          const storagePercent = cloudStorage?.percent_used ?? (storageLimit > 0 ? Math.min(100, Math.round((storageUsed / storageLimit) * 100)) : 0);
          const filesCount = cloudStorage?.files_count ?? 0;
          const isOver = cloudStorage?.over_limit || storageUsed >= storageLimit;

          return (
            <div className="space-y-6 pt-1">
              {/* Barre de progression */}
              <div className="space-y-2">
                <div className="flex items-end justify-between text-sm">
                  <p className="text-slate-600">
                    <span className="font-bold text-slate-900">
                      {formatStorageBytes(storageUsed)}
                    </span>{" "}
                    / {formatStorageBytes(storageLimit)} consommés
                  </p>
                  <p className={`font-semibold ${isOver || storagePercent >= 90 ? "text-red-600 font-bold" : "text-slate-900"}`}>
                    {storagePercent}%
                  </p>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${storagePercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      isOver || storagePercent >= 90
                        ? "bg-red-500"
                        : storagePercent >= 70
                          ? "bg-amber-500"
                          : "bg-gradient-to-r from-purple-500 to-blue-500"
                    }`}
                  />
                </div>
              </div>

              {/* Cartes de statistiques clés */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-white/60 border border-slate-200/80 p-3.5 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Espace Utilisé</p>
                  <p className="text-base font-black text-slate-900">{formatStorageBytes(storageUsed)}</p>
                </div>
                <div className="rounded-2xl bg-white/60 border border-slate-200/80 p-3.5 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Limite du Forfait</p>
                  <p className="text-base font-black text-slate-900">{formatStorageBytes(storageLimit)}</p>
                </div>
                <div className="rounded-2xl bg-white/60 border border-slate-200/80 p-3.5 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Fichiers Stockés</p>
                  <p className="text-base font-black text-slate-900">{filesCount}</p>
                </div>
                <div className="rounded-2xl bg-white/60 border border-slate-200/80 p-3.5 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Forfait Actuel</p>
                  <p className="text-base font-black text-purple-700">{tier}</p>
                </div>
              </div>

              {/* Limites officielles par forfait */}
              <div className="rounded-2xl bg-purple-50/60 border border-purple-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Quotas de Stockage par Forfait
                  </span>
                  <Link href="/pricing" className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline">
                    Augmenter mon quota →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { tierName: "Free", limitText: "500 MO" },
                    { tierName: "Plus", limitText: "1 GB" },
                    { tierName: "Pro", limitText: "2 GB" },
                    { tierName: "Max", limitText: "5 GB" },
                  ].map((p) => {
                    const isUserPlan = tier.toLowerCase() === p.tierName.toLowerCase();
                    return (
                      <div
                        key={p.tierName}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isUserPlan
                            ? "bg-purple-600 text-white font-bold border-purple-600 shadow-sm ring-2 ring-purple-400/50"
                            : "bg-white/70 text-slate-700 border-slate-200/70"
                        }`}
                      >
                        <p className={`text-[10px] uppercase font-black ${isUserPlan ? "text-purple-100" : "text-slate-500"}`}>{p.tierName}</p>
                        <p className="text-sm font-extrabold mt-0.5">{p.limitText}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Appareils Connectés */}
      <section 
        id="appareils" 
        className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-purple-600" />
          Appareils Connectés
        </h2>
        <p className="text-sm text-slate-600">
          Consultez et gérez les appareils actuellement connectés à votre compte.
        </p>
        <DevicesList />
      </section>

      {/* Upgrade code */}
      <section id="upgrade-code" className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4">
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
      </div>
    </div>
  );
}
