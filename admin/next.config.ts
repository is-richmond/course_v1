import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    configPort: 'http://91.147.110.93/v1',
    authPort: 'http://localhost/v1',
    newsPort: 'http://91.147.110.93/v1',
    walletPort: "http://91.147.110.93/v1/wallet/",
    supportPort: 'http://91.147.110.93/v1/support',
    notificationPort: "http://91.147.110.93/v1/templates",
    agentPort: "http://localhost/v1",
    providerPort: "http://91.147.110.93/v1",
    // generalPort: "http://91.147.110.93",
    clientPort: 'http://localhost/v1',
  },
  // Добавляем настройку rewrites для проксирования запросов
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://91.147.110.93/v1/:path*',
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.nkz.icdc.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
