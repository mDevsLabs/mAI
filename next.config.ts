import { defineConfig } from './src/libs/next/config/define-config';

const isVercel = !!process.env.VERCEL_ENV;

const vercelConfig = {
  // Vercel serverless optimization: exclude musl binaries from all routes
  // Vercel uses Amazon Linux (glibc), not Alpine Linux (musl)
  // This saves ~45MB (29MB canvas-musl) per serverless function
  // ⚠️ NOTE: sharp MUST be included for Vercel Serverless Functions
  // Do NOT exclude any sharp-related files as they are required for image processing
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
  // Force Next.js to include sharp binaries in serverless functions
  // This is required for Vercel's Linux environment
  experimental: {
    // Disable output file tracing for sharp to ensure binaries are included
    outputFileTracingRoot: process.env.NODE_ENV === 'production' ? undefined : undefined,
  },
};
const nextConfig = defineConfig({
  ...(isVercel ? vercelConfig : {}),
});

export default nextConfig;
