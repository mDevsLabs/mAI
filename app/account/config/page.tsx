import { Metadata } from 'next';
import ConfigClient from './ConfigClient';

export const metadata: Metadata = {
  title: 'Configuration API & SDKs | mProjects',
  description:
    'Générez dynamiquement vos extraits de code pour intégrer nos API avec les SDK OpenAI, Google, Anthropic, Python et cURL.',
};

export default function ApiConfigPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ConfigClient />
      </div>
    </main>
  );
}
