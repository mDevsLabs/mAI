import { SpeedInsights } from '@vercel/speed-insights/next';
import { type ReactNode, Suspense } from 'react';

import Analytics from '@/components/Analytics';

const inVercel = process.env.VERCEL === '1';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html suppressHydrationWarning lang={'en'} style={{ height: '100%' }}>
      <head>
        <link rel="preload" href="/icons/icon-512x512.png" as="image" />
      </head>
      <body style={{ height: '100%', margin: 0 }}>
        {children}
        <Suspense fallback={null}>
          <Analytics />
          {inVercel && <SpeedInsights />}
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
