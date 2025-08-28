import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration for better performance
  output: 'standalone',
  
  // Otimizações de imagens
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    // Otimizações de performance
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Add image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours
  },
  
  // Otimizações de bundling
  webpack: (config, { dev, isServer }) => {
    // Fix Windows file system issues
    if (!dev) {
      config.stats = {
        ...config.stats,
        excludeAssets: [/trace/], // Exclude trace files causing Windows permission issues
      }
    }
    
    // Server-side optimizations
    if (isServer) {
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        // Externalize heavy client-only packages
        config.externals.push(/^gsap/, /^motion/)
      }
      
      // Disable server-side chunk splitting
      config.optimization = config.optimization || {}
      config.optimization.splitChunks = false
    } else {
      // Client-side chunk splitting optimization
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 200000, // Reduced for better loading
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              chunks: 'all',
              enforce: true,
            },
            firebase: {
              test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              name: 'firebase',
              priority: 15,
              chunks: 'all',
              enforce: true,
            },
            animations: {
              test: /[\\/]node_modules[\\/](gsap|motion|framer-motion)[\\/]/,
              name: 'animations',
              priority: 20,
              chunks: 'all',
              enforce: true,
            },
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
              name: 'ui',
              priority: 12,
              chunks: 'all',
              enforce: true,
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      }
    }

    // Bundle analysis only in development
    if (process.env.ANALYZE === 'true' && !isServer) {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')
      config.plugins.push(new BundleAnalyzerPlugin({ openAnalyzer: true }))
    }

    return config
  },

  // Headers de performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Compressão
  compress: true,
  
  // External packages for server components
  serverExternalPackages: ['react-router-dom', 'gsap'],

  // Otimizações experimentais
  experimental: {
    // Modern build optimizations
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Enable when CSS optimization issue is resolved
    // optimizeCss: true,
    // Server actions for better API performance
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },

  // Build settings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Logging otimizado
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // Otimização do runtime
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
