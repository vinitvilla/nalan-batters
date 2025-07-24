import type { NextConfig } from "next";

const isStaging = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_APP_ENV === 'staging';
const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // SEO and Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
    ];
  },
  
  // Environment-specific configuration
  env: {
    APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Nalan Batters',
  },
  
  // Staging-specific optimizations
  ...(isStaging && {
    generateEtags: false,
    poweredByHeader: false,
    compress: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
  }),
  
  // Development-specific settings
  ...(isDevelopment && {
    reactStrictMode: true,
  }),
};

export default nextConfig;
