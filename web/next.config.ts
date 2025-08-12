import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  eslint: {
    // Evita que o build quebre por erros de ESLint (útil em CI/dev)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
