"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { OnboardingOverlay } from "./onboarding-overlay";
import { MAIN_STEPS } from "./steps-main.config";
import { UPGRADE_STEPS } from "./steps-upgrade.config";
import type { Flow, OnboardingState } from "./types";
import {
  getMainStore,
  setMainStore,
  markMainCompleted,
  markMainDismissed,
  shouldShowMain,
  getUpgradeStore,
  setUpgradeStore,
  markUpgradeCompleted,
  markUpgradeDismissed,
  shouldShowUpgrade,
} from "@/lib/onboarding-storage";

type Ctx = {
  openMain: () => void;
  openUpgrade: (tier: string, prevTier?: string | null) => void;
  close: () => void;
};

const OnboardingContext = createContext<Ctx | null>(null);

export function useOnboarding() {
  const c = useContext(OnboardingContext);
  if (!c) throw new Error("useOnboarding must be inside OnboardingProvider");
  return c;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, usage, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [state, setState] = useState<OnboardingState>({
    flow: null,
    open: false,
    stepIndex: 0,
    tier: "Free",
    username: "",
    email: "",
    prevTier: null,
  });

  const tier = usage?.tier || user?.tier || "Free";
  const username = user?.username || usage?.username || "";
  const email = user?.email || usage?.email || "";

  // helpers
  const openMain = useCallback(() => {
    const store = getMainStore();
    const step = store?.step ?? 0;
    setState({
      flow: "main",
      open: true,
      stepIndex: Math.min(step, MAIN_STEPS.length - 1),
      tier,
      username,
      email,
      prevTier: null,
    });
  }, [tier, username, email]);

  const openUpgrade = useCallback(
    (newTier: string, prevTier?: string | null) => {
      const store = getUpgradeStore();
      const step = store?.step ?? 0;
      setState({
        flow: "upgrade",
        open: true,
        stepIndex: Math.min(step, UPGRADE_STEPS.length - 1),
        tier: newTier || tier,
        username,
        email,
        prevTier: prevTier ?? null,
      });
    },
    [tier, username, email]
  );

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false, flow: null }));
  }, []);

  // persist step on change
  useEffect(() => {
    if (!state.open || !state.flow) return;
    if (state.flow === "main") setMainStore({ step: state.stepIndex });
    if (state.flow === "upgrade") setUpgradeStore({ step: state.stepIndex });
  }, [state.open, state.flow, state.stepIndex]);

  // auto-open logic: after hydration, if pending main, open
  useEffect(() => {
    if (!isAuthenticated) return;
    // ne jamais ouvrir sur les pages d'auth (évite flash sur /login /register)
    if (pathname?.startsWith("/account/login") || pathname?.startsWith("/account/register")) return;

    // demo helpers via query param: ?onboarding=demo | ?onboarding=upgrade-demo
    try {
      const p = new URLSearchParams(window.location.search).get("onboarding");
      if (p === "demo") {
        const t = window.setTimeout(() => openMain(), 400);
        return () => clearTimeout(t);
      }
      if (p === "upgrade-demo") {
        const t = window.setTimeout(() => openUpgrade(tier || "Pro", "Free"), 400);
        return () => clearTimeout(t);
      }
    } catch {}

    // small delay to allow usage to hydrate and avoid flash during login page
    const t = window.setTimeout(() => {
      // priority: main onboarding first
      if (shouldShowMain()) {
        openMain();
        return;
      }
      // then upgrade if pending (exists and not completed)
      const u = getUpgradeStore();
      if (u && shouldShowUpgrade()) {
        // show upgrade only if not already showing main
        openUpgrade(u.lastTier || tier, null);
      }
    }, 650);
    return () => clearTimeout(t);
  }, [isAuthenticated, tier, openMain, openUpgrade, pathname]);

  // listen to global custom events dispatched from auth pages
  useEffect(() => {
    const onOpen = (e: Event) => {
      const ce = e as CustomEvent<{ flow: Flow; tier?: string; prevTier?: string | null }>;
      const flow = ce.detail?.flow;
      if (flow === "main") {
        openMain();
      } else if (flow === "upgrade") {
        const newTier = ce.detail?.tier || tier;
        const prev = ce.detail?.prevTier ?? null;
        openUpgrade(newTier, prev);
      }
    };
    window.addEventListener("mai:onboarding:open" as unknown as string, onOpen as EventListener);
    // expose for console debug: window.__maiOnboarding.openMain() / openUpgrade("Pro")
    try {
      const w = window as unknown as Record<string, unknown>;
      w.__maiOnboarding = { openMain, openUpgrade: (t: string) => openUpgrade(t, tier) };
    } catch {}
    return () => window.removeEventListener("mai:onboarding:open" as unknown as string, onOpen as EventListener);
  }, [openMain, openUpgrade, tier]);

  const steps = state.flow === "upgrade" ? UPGRADE_STEPS : MAIN_STEPS;

  const context = useMemo(
    () => ({
      flow: state.flow as Flow,
      tier: state.tier,
      username: state.username || username,
      email: state.email || email,
      prevTier: state.prevTier,
    }),
    [state.flow, state.tier, state.username, state.email, state.prevTier, username, email]
  );

  const handleNext = useCallback(() => {
    setState((s) => ({ ...s, stepIndex: Math.min(s.stepIndex + 1, steps.length - 1) }));
  }, [steps.length]);

  const handlePrev = useCallback(() => {
    setState((s) => ({ ...s, stepIndex: Math.max(0, s.stepIndex - 1) }));
  }, []);

  const handleSkip = useCallback(() => {
    if (state.flow === "main") markMainDismissed();
    if (state.flow === "upgrade") markUpgradeDismissed();
    close();
  }, [state.flow, close]);

  const handleComplete = useCallback(() => {
    if (state.flow === "main") markMainCompleted();
    if (state.flow === "upgrade") markUpgradeCompleted();
    close();
  }, [state.flow, close]);

  const handleGoKeys = useCallback(() => {
    if (state.flow === "main") markMainCompleted();
    if (state.flow === "upgrade") markUpgradeCompleted();
    close();
    // slight delay to allow exit animation
    window.setTimeout(() => router.push("/account/keys?onboarding=create"), 180);
  }, [state.flow, close, router]);

  const handleGoModels = useCallback(() => {
    if (state.flow === "main") markMainCompleted();
    if (state.flow === "upgrade") markUpgradeCompleted();
    close();
    window.setTimeout(() => router.push("/account/models"), 180);
  }, [state.flow, close, router]);

  const value = useMemo<Ctx>(
    () => ({ openMain, openUpgrade, close }),
    [openMain, openUpgrade, close]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      <OnboardingOverlay
        open={state.open && !!state.flow}
        flow={(state.flow as Flow) ?? "main"}
        steps={steps}
        stepIndex={state.stepIndex}
        context={context}
        onNext={handleNext}
        onPrev={handlePrev}
        onSkip={handleSkip}
        onComplete={handleComplete}
        onGoKeys={handleGoKeys}
        onGoModels={handleGoModels}
      />
    </OnboardingContext.Provider>
  );
}
