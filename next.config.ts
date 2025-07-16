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
