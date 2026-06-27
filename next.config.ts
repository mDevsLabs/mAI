import { defineConfig } from './src/libs/next/config/define-config';

const isVercel = !!process.env.VERCEL_ENV;

const vercelConfig = {
  // Vercel serverless optimization: exclude musl binaries from all routes
  // Vercel uses Amazon Linux (glibc), not Alpine Linux (musl)
  // This saves ~45MB (29MB canvas-musl) per serverless function
  outputFileTracingExcludes: {
    '*': [
      'node_modules/.pnpm/@napi-rs+canvas-*-musl*',
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
    // Use our sharp mock instead of the real sharp module in serverless
    // This is the only reliable way to use sharp-related code in Vercel Serverless Functions
    serverComponentsExternalPackages: ['sharp'],
  },
  // Transpile packages to ensure our mock is used
  transpilePackages: ['sharp'],
};
const nextConfig = defineConfig({
  ...(isVercel ? vercelConfig : {}),
  // Replace sharp with our mock in Vercel serverless environments
  webpack: (config, { isServer, dev }) => {
    // In Vercel serverless (which uses webpack), replace sharp with our mock
    if (isServer && isVercel) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Replace sharp with our serverless-compatible mock
        sharp: require.resolve('./src/libs/sharp.serverless.ts'),
      };
    }
    return config;
  },
});

export default nextConfig;
