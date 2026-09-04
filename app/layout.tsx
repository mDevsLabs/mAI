import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
      <head>
        <link rel="preconnect" href="https://upload.fs.fr" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.botpress.cloud" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://upload.fs.fr" />
        <link rel="dns-prefetch" href="https://cdn.botpress.cloud" />
      </head>
      <body
        className="antialiased font-sans min-h-[100dvh] flex flex-col pt-24 overflow-x-hidden relative bg-white text-slate-900"
      >
          <ToastProvider>
            <AuthProvider>
              <OnboardingProvider>
              <Navbar changelogs={changelogs} news={news} />
              <CookieBanner />
              {/* Main Content */}
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-32 pt-6 z-10">
                {children}
              </main>

              <footer className="relative mt-auto mb-4 w-[95%] max-w-5xl mx-auto md:fixed md:bottom-4 md:left-1/2 md:-translate-x-1/2 z-50 rounded-full border border-neutral-200/90 bg-white/85 backdrop-blur-md shadow-xs px-4 md:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0 transition-all duration-300">
                <p className="text-xs md:text-sm text-neutral-500 font-normal">
                  {new Date().getFullYear()} © All rights reserved | mAI | Official Website
                </p>

                {/* Menu Déroulant Légal */}
                <FooterLegal />
              </footer>
              </OnboardingProvider>
            </AuthProvider>
          </ToastProvider>
          <BackToTop />
          <StatusWidget />
        <Script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js" strategy="lazyOnload" />
        <Script src="https://files.bpcontent.cloud/2026/05/02/11/20260502114920-JBX5UCAM.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
