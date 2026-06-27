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
  // Replace native modules with our mocks in Vercel serverless environments
  webpack: (config, { isServer, dev }) => {
    // In Vercel serverless (which uses webpack), replace native modules with mocks
    if (isServer && isVercel) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Replace sharp with our serverless-compatible mock
        sharp: require.resolve('./src/libs/sharp.serverless.ts'),
        // Replace @napi-rs/canvas with our mock
        '@napi-rs/canvas': require.resolve('./src/libs/canvas.serverless.ts'),
        // Replace zlib-sync with our mock
        'zlib-sync': require.resolve('./src/libs/zlib-sync.serverless.ts'),
      };
    }
    return config;
  },
});

export default nextConfig;
