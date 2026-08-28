import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { BackToTop } from "@/components/back-to-top";
import { StatusWidget } from "@/components/status-widget";
import { AuthProvider } from "@/components/auth-provider";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";
import { ToastProvider, CookieBanner } from "@/components/ui/index";
import { getChangelogs } from "@/lib/changelog";
import { getNewsArticles } from "@/lib/news";
import { FooterLegal } from "@/components/footer-legal";

const inter = {
  variable: "font-sans inter-variable",
};

const spaceGrotesk = {
  variable: "font-space-grotesk space-grotesk-variable",
};

export const metadata: Metadata = {
  title: {
    default: "mAI - Just build",
    template: "%s | mAI - Just build",
  },
  description:
    "Portail de suivi des versions, documentation et outils d'intelligence artificielle de mDevsLabs.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  viewportFit: "auto",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const changelogs = getChangelogs();
  const news = getNewsArticles();

  return (
    <html lang="fr" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body
        className="antialiased font-sans min-h-[100dvh] flex flex-col pt-24 overflow-x-hidden relative bg-white text-slate-900"
      >
          <ToastProvider>
            <AuthProvider>
              <OnboardingProvider>
              <Navbar changelogs={changelogs} news={news} />
              <CookieBanner />
              {/* Background Orbs */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
              <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-400/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-12 md:pb-32 pt-6 z-10">
                {children}
              </main>

              <footer className="relative mt-auto mb-4 w-[95%] max-w-5xl mx-auto md:fixed md:bottom-4 md:left-1/2 md:-translate-x-1/2 z-50 rounded-3xl md:rounded-full border border-black/10 bg-white/30 backdrop-blur-md shadow-sm px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0 transition-all duration-300">
                <p className="text-xs md:text-sm text-slate-500 font-medium">
                  {new Date().getFullYear()} © All rights reserved | mAI | Official Website
                </p>

                {/* Menu Déroulant Légal */}
                <FooterLegal />
              </footer>

              {/* Footer Decorative */}
              <footer className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-400 z-50"></footer>
              </OnboardingProvider>
            </AuthProvider>
          </ToastProvider>
          <BackToTop />
          <StatusWidget />
        <script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"></script>
        <script src="https://files.bpcontent.cloud/2026/05/02/11/20260502114920-JBX5UCAM.js" defer></script>
      </body>
    </html>
  );
}
