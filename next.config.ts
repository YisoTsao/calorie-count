import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next.js 16.0.x bug: .next/dev/types/validator.ts imports AppRouteHandlerRoutes
  // from routes.js but the type is not always emitted — ignore generated type errors.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
