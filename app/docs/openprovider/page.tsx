import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getOpenProviderDocs } from '@/lib/docs';
import { DocsClient } from '../DocsClient';

export const metadata: Metadata = {
  title: 'Documentation OpenProvider | mProjects',
  description: 'Documentation technique complète pour OpenProvider.',
};

export default function OpenProviderDocsPage() {
  const initialDocs = getOpenProviderDocs();

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-8">
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Chargement de la documentation...</div>}>
        <DocsClient initialDocs={initialDocs} titleSpan="OpenProvider" />
      </Suspense>
    </div>
  );
}
