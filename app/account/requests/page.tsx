"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import RequestsClient from "./RequestsClient";

export default function ApiRequestsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/account/login?next=${encodeURIComponent('/account/requests')}`);
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center py-40 min-h-screen">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span>Vérification de la session...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête de page */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="text-left space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-[0.9] uppercase text-slate-900">
              Studio de <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
                Requêtes API
              </span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-light max-w-2xl">
              Explorez et exécutez directement toutes les routes de l&apos;API mProjects. Générez vos extraits de code en cURL, JavaScript, Python et Node.js, puis exportez ou partagez vos résultats.
            </p>
          </div>
        </div>

        {/* Composant interactif d'exploration et d'exécution des requêtes */}
        <RequestsClient />
      </div>
    </main>
  );
}
