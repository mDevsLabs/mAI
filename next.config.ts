import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "react-icons",
      "motion",
      "clsx",
      "tailwind-merge",
      "react-use",
      "cmdk"
    ],
  },
  images: {
    minimumCacheTTL: 2592000, // 30 jours de cache
    remotePatterns: [
      { protocol: "https", hostname: "upload.fs.fr" },
      { protocol: "https", hostname: "files.bpcontent.cloud" },
      { protocol: "https", hostname: "mai.instatus.com" },
      { protocol: "https", hostname: "openrouter.ai" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "s3.z1storage.com" },
      { protocol: "https", hostname: "*.s3.z1storage.com" },
      { protocol: "https", hostname: "*.z1storage.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
