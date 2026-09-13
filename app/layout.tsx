import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { BackToTop } from "@/components/back-to-top";
import { StatusWidget } from "@/components/status-widget";
import { AuthProvider } from "@/components/auth-provider";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";
import { ToastProvider, CookieBanner } from "@/components/ui/index";
import { MotionProvider } from "@/components/motion-provider";
import { getChangelogs } from "@/lib/changelog";
import { getNewsArticles } from "@/lib/news";
import { FooterLegal } from "@/components/footer-legal";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const changelogs = getChangelogs();
  const news = getNewsArticles();

  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://upload.fs.fr" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.botpress.cloud" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://upload.fs.fr" />
        <link rel="dns-prefetch" href="https://cdn.botpress.cloud" />
      </head>
      <body
        className="antialiased font-sans min-h-[100dvh] flex flex-col pt-safe-header overflow-x-hidden relative bg-white text-slate-900"
      >
        <MotionProvider>
          <ToastProvider>
            <AuthProvider>
              <OnboardingProvider>
              <Navbar changelogs={changelogs} news={news} />
              <CookieBanner />
              {/* Background Orbs — dérive lente, GPU-friendly (blur sur l'enfant, transform sur le wrapper) */}
              <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
              >
                <div className="absolute -top-24 -left-24 h-96 w-96 will-change-transform animate-orb-a">
                  <div className="h-full w-full rounded-full bg-purple-400/20 blur-[120px]"></div>
                </div>
                <div className="absolute top-1/3 -right-24 h-80 w-80 will-change-transform animate-orb-b">
                  <div className="h-full w-full rounded-full bg-blue-400/20 blur-[100px]"></div>
                </div>
                <div className="absolute -bottom-32 left-1/4 h-80 w-80 will-change-transform animate-orb-c [animation-delay:-24s]">
                  <div className="h-full w-full rounded-full bg-emerald-300/20 blur-[110px]"></div>
                </div>
              </div>

              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-12 md:pb-32 pt-6 z-10">
                {children}
              </main>

              <footer className="relative mt-auto mb-4 w-[95%] max-w-5xl mx-auto md:fixed md:safe-bottom-4 md:left-1/2 md:-translate-x-1/2 z-40 rounded-3xl md:rounded-full glass-strong px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
                <p className="text-xs md:text-sm text-slate-500 font-medium">
                  {new Date().getFullYear()} © All rights reserved | mAI | Official Website
                </p>

                {/* Menu Déroulant Légal */}
                <FooterLegal />
              </footer>

              {/* Footer Decorative */}
              <footer aria-hidden="true" className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-400 z-50 pointer-events-none"></footer>
              </OnboardingProvider>
            </AuthProvider>
          </ToastProvider>
          <BackToTop />
          <StatusWidget />
        </MotionProvider>
        <Script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js" strategy="lazyOnload" />
        <Script src="https://files.bpcontent.cloud/2026/05/02/11/20260502114920-JBX5UCAM.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
