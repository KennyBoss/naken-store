import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['naken.store'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/placeholder/**',
      },
      {
        protocol: 'https',
        hostname: 'naken.store',
        pathname: '/api/placeholder/**',
      },
    ],
  },
  
  // Заголовки безопасности для продакшена
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.yookassa.ru",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: *.yookassa.ru",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.yookassa.ru",
              "frame-src 'self' https://checkout.yookassa.ru",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // HSTS - принудительное использование HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // Защита от XSS
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Защита от MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Запрет встраивания в iframe
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Контроль referrer
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Разрешения для API
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self)'
          },
          // Контроль кеширования только для админки (не для всего сайта)
          {
            key: 'X-Admin-Access',
            value: 'restricted'
          }
        ],
      },
      // Специальные заголовки для админки
      {
        source: '/admin/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet'
          }
        ]
      }
    ]
  },
  
  // Настройки для production
  ...(process.env.NODE_ENV === 'production' && {
    output: 'standalone', // ВКЛЮЧАЕМ STANDALONE ДЛЯ ДЕПЛОЯ
    poweredByHeader: false, // Убираем заголовок X-Powered-By
    compress: true,
    generateEtags: false,
    
    // Оптимизация для безопасности
    serverExternalPackages: ['bcryptjs']
  })
};

export default nextConfig;
