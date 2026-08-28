'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Loader2 } from 'lucide-react';

export default function ApiPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/account/login?next=%2Fapi%2Fkeys');
      } else {
        router.replace('/account/keys');
      }
    }
  }, [loading, isAuthenticated, router]);

  return (
    <div className="flex justify-center items-center py-40 min-h-screen">
      <div className="flex items-center gap-3 text-slate-500 font-medium">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        <span>Redirection vers les Clés API...</span>
      </div>
    </div>
  );
}
