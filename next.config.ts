import { defineConfig } from './src/libs/next/config/define-config';

const isVercel = !!process.env.VERCEL_ENV;

const vercelConfig = {
  // Vercel serverless optimization: exclude musl binaries from all routes
  // Vercel uses Amazon Linux (glibc), not Alpine Linux (musl)
  // This saves ~45MB (29MB canvas-musl) per serverless function
  outputFileTracingExcludes: {
    '*': [
      'node_modules/.pnpm/@napi-rs+canvas-*-musl*',
      'node_modules/.pnpm/@napi-rs+canvas-*',
      'node_modules/.pnpm/sharp-*',
      'node_modules/.pnpm/zlib-sync-*',
      // Exclude SPA/desktop/mobile build artifacts from serverless functions
      'public/_spa/**',
      'dist/desktop/**',
      'dist/mobile/**',
      'apps/desktop/**',
      'packages/database/migrations/**',
    ],
  },
  // Replace sharp with our mock in serverless environments
  // This prevents ERR_DLOPEN_FAILED: libvips-cpp.so.8.18.3 errors in Vercel
  experimental: {
    // Turbopack doesn't support serverComponentsExternalPackages in Next.js 16
    // We use webpack alias instead for serverless functions
  },
};
const nextConfig = defineConfig({
  ...(isVercel ? vercelConfig : {}),
  // CRITICAL: Replace native modules with our safe mocks
  // This prevents Turbopack from trying to bundle native modules
  webpack: (config, { isServer }) => {
    // Replace ALL imports of these modules with our safe mocks
    // This works for both Vercel and local development
    config.resolve.alias = {
      ...config.resolve.alias,
      // CRITICAL: Use sharp.safe.ts which NEVER imports the real sharp
      sharp: require.resolve('./src/libs/sharp.safe.ts'),
      // Mock other native modules
      '@napi-rs/canvas': require.resolve('./src/libs/canvas.serverless.ts'),
      'zlib-sync': require.resolve('./src/libs/zlib-sync.serverless.ts'),
    };
    return config;
  },
});

export default nextConfig;
