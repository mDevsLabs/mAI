import { Metadata } from 'next';
import PlaygroundClient from './PlaygroundClient';

export const metadata: Metadata = {
  title: 'Playground IA | mProjects',
  description:
    'Testez les modèles de la famille mAI en direct. Streaming, contrôles de température et suivi des performances en temps réel.',
};

export default function PlaygroundPage() {

  return (
    <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête de Page */}
        <div className="border-b border-slate-200/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Terrain de Jeu IA
            </h1>
            <p className="text-slate-600 text-sm max-w-2xl">
              Expérimentez directement avec vos modèles d&apos;IA. Contrôlez la température, le prompt système et suivez la vitesse de génération en streaming.
            </p>
          </div>
        </div>

        {/* Composant Client */}
        <PlaygroundClient />
      </div>
    </main>
  );
}
