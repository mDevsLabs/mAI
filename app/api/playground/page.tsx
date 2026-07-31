'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Loader2 } from 'lucide-react';

export default function ApiPlaygroundPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/account/login?next=%2Fplayground');
      } else {
        router.replace('/playground');
      }
    }
  }, [loading, isAuthenticated, router]);

  return (
    <div className="flex justify-center items-center py-40 min-h-screen">
      <div className="flex items-center gap-3 text-slate-500 font-medium">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        <span>Redirection vers le Terrain de jeu...</span>
      </div>
    </div>
  );
}
