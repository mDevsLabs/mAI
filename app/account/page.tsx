"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, PartyPopper, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useWindowSize } from "react-use";
import toast from "react-hot-toast";

import { useAuth } from "@/components/auth-provider";
import { MaiApiError } from "@/lib/mai-api";
import { ACCOUNT_SECTION_IDS, AccountNavigation, type AccountSectionId } from "@/components/account/account-navigation";
import { ApiUsageSection } from "@/components/account/api-usage-section";
import { AudioUsageSection } from "@/components/account/audio-usage-section";
import { CloudStorageSection } from "@/components/account/cloud-storage-section";
import { DevicesSection } from "@/components/account/devices-section";
import { ImageUsageSection } from "@/components/account/image-usage-section";
import { MaiUsageSection } from "@/components/account/mai-usage-section";
import { ProfileSection } from "@/components/account/profile-section";
import { QuotaResetsSection } from "@/components/account/quota-resets-section";
import { UpgradeCelebration } from "@/components/account/upgrade-celebration";
import { UpgradeCodeSection } from "@/components/account/upgrade-code-section";
import { useAccountDashboard } from "@/components/account/use-account-dashboard";

export default function AccountPage() {
  const router = useRouter();
  const { logout, verifyUpgradeCode } = useAuth();
  const dashboard = useAccountDashboard();
  const { width, height } = useWindowSize();

  const [activeSection, setActiveSection] = useState<string>("profil");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRocket, setShowRocket] = useState(false);
  const [upgradedTier, setUpgradedTier] = useState<string | null>(null);
  const celebrationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollTo = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const y = element.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      let current: AccountSectionId = "profil";
      for (const section of ACCOUNT_SECTION_IDS) {
        const element = document.getElementById(section);
        if (element && element.getBoundingClientRect().top <= 150) {
          current = section;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (dashboard.authLoading || !dashboard.isAuthenticated) return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const timer = window.setTimeout(() => scrollTo(hash), 150);
    return () => window.clearTimeout(timer);
  }, [dashboard.authLoading, dashboard.isAuthenticated, scrollTo]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) scrollTo(hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [scrollTo]);

  useEffect(() => {
    if (!dashboard.authLoading && !dashboard.isAuthenticated) {
      router.replace("/account/login?next=%2Faccount");
    }
  }, [dashboard.authLoading, dashboard.isAuthenticated, router]);

  useEffect(
    () => () => {
      if (celebrationTimeout.current) clearTimeout(celebrationTimeout.current);
    },
    [],
  );

  const handleLogout = () => {
    logout();
    toast.success("Déconnecté");
    router.push("/account/login");
  };

  const handleRefreshAll = async () => {
    const result = await dashboard.refreshAll();
    if (result.usageResult) toast.success("Quotas actualisés");
    else toast.error("Session expirée");
  };

  const handleRefreshApi = async () => {
    try {
      await dashboard.refreshApiUsage();
      toast.success("Usage API actualisé !");
    } catch {
      toast.error("Erreur lors de l'actualisation de l'usage API.");
    }
  };

  const handleRefreshImages = async () => {
    try {
      await dashboard.refreshImages();
      toast.success("Usage Images actualisé !");
    } catch {
      toast.error("Erreur lors de l'actualisation des images.");
    }
  };

  const handleRefreshAudio = async () => {
    try {
      await dashboard.refreshAudio();
      toast.success("Usage Audio actualisé !");
    } catch {
      toast.error("Erreur lors de l'actualisation de l'audio.");
    }
  };

  const handleRefreshStorage = async () => {
    try {
      const result = await dashboard.refreshStorage();
      if (result) toast.success("Quota de stockage actualisé");
      else toast.error("Erreur lors de l'actualisation du stockage");
    } catch {
      toast.error("Erreur serveur lors du rafraîchissement.");
    }
  };

  const handleUpgrade = async (event: FormEvent) => {
    event.preventDefault();
    setCodeError("");

    const cleanCode = code.trim();
    if (!cleanCode) {
      setCodeError("Saisissez un code.");
      return;
    }

    const previousTier = dashboard.user?.tier || dashboard.usage?.tier || "Free";
    setUpgrading(true);
    try {
      const tier = await verifyUpgradeCode(cleanCode);
      setCode("");
      setUpgradedTier(tier);
      setShowConfetti(true);
      setShowRocket(true);

      const audio = new Audio("/sounds/plan-update.mp3");
      audio.play().catch(() => undefined);

      await dashboard.refreshAll();

      toast.custom(
        () => (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/20"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <div>
                <p className="font-black text-base">
                  Merci d&apos;avoir souscrit au forfait {tier} !{" "}
                  <PartyPopper className="inline w-4 h-4 align-middle" />
                </p>
                <p className="text-xs text-purple-100 mt-0.5">
                  Vos quotas étendus sont immédiatement disponibles !
                </p>
              </div>
            </div>
          </motion.div>
        ),
        { duration: 6000 },
      );

      try {
        const { initUpgradeForTier } = await import("@/lib/onboarding-storage");
        initUpgradeForTier(tier);
        window.dispatchEvent(
          new CustomEvent("mai:onboarding:open", {
            detail: { flow: "upgrade", tier, prevTier: previousTier },
          }),
        );
      } catch {}

      if (celebrationTimeout.current) clearTimeout(celebrationTimeout.current);
      celebrationTimeout.current = setTimeout(() => {
        setShowConfetti(false);
        setShowRocket(false);
        setUpgradedTier(null);
      }, 5000);
    } catch (error) {
      const message =
        error instanceof MaiApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Code invalide.";
      setCodeError(message);
      toast.error(message);
    } finally {
      setUpgrading(false);
    }
  };

  if (dashboard.authLoading || !dashboard.isAuthenticated || !dashboard.user) {
    return (
      <div className="flex justify-center py-20 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon compte mAI</h1>
          <p className="text-slate-600 text-sm mt-1">
            Gérez vos informations personnelles, forfaits et quotas d&apos;API.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" /> Se déconnecter
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <AccountNavigation activeSection={activeSection} onNavigate={scrollTo} />

        <div className="flex-1 space-y-8">
          <UpgradeCelebration show={showConfetti && showRocket} width={width} height={height} />

          <ProfileSection upgradedTier={upgradedTier} />

          <ApiUsageSection
            stats={dashboard.apiUsageStats}
            tier={dashboard.user.tier}
            apiBoost={dashboard.apiBoost}
            refreshing={dashboard.refreshingApi}
            onRefresh={handleRefreshApi}
          />

          <ImageUsageSection
            usage={dashboard.imageUsage}
            tier={dashboard.user.tier}
            refreshing={dashboard.refreshingImages}
            onRefresh={handleRefreshImages}
          />

          <AudioUsageSection
            usage={dashboard.audioUsage}
            refreshing={dashboard.refreshingAudio}
            onRefresh={handleRefreshAudio}
          />

          <MaiUsageSection
            usage={dashboard.usage}
            percent={dashboard.maiPercent}
            refreshing={dashboard.refreshing}
            onRefresh={handleRefreshAll}
          />

          <CloudStorageSection
            usage={dashboard.cloudStorage}
            tier={dashboard.user.tier}
            refreshing={dashboard.refreshingStorage}
            onRefresh={handleRefreshStorage}
          />

          <DevicesSection />

          <QuotaResetsSection
            resets={dashboard.availableResets}
            loading={dashboard.loadingResets}
            claimingId={dashboard.claimingResetId}
            onRefresh={dashboard.loadResets}
            onClaim={dashboard.claimReset}
          />

          <UpgradeCodeSection
            code={code}
            error={codeError}
            upgrading={upgrading}
            onCodeChange={setCode}
            onSubmit={handleUpgrade}
          />
        </div>
      </div>
    </div>
  );
}
