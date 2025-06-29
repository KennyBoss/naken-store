import path from 'path';
import { fileURLToPath } from 'url';

// Получаем __dirname в ES-модуле
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, './'),
  
  // Настройки изображений - ЕДИНАЯ СЕКЦИЯ
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'naken.store',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'], // Современные форматы
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Размеры под устройства
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Размеры для layout="intrinsic"
    minimumCacheTTL: 86400, // Кеш на 24 часа
    // Разрешаем загрузку с любых доменов (для placeholder.jpg)
    unoptimized: true,
  },
  
  // Минимальные оптимизации без увеличения bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Убираем console.log в продакшене
  },
  
  // Настройки для статических файлов
  async rewrites() {
    return [
      // Файл подтверждения для Яндекс.Вебмастера
      {
        source: '/yandex_72675fdb9fd65deb.html',
        destination: '/api/yandex_72675fdb9fd65deb.html',
      },
    ];
  },
};

export default nextConfig;
