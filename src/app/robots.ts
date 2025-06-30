import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://naken.store'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/_next/',
          '/checkout/',
          '/cart/',
          '/profile/',
          '*.pdf',
          '*.doc',
          '*.docx'
        ],
      },
      // Специальные правила для Яндекс бота
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/_next/',
          '/checkout/',
          '/cart/',
          '/profile/'
        ],
        crawlDelay: 1 // Пауза для Яндекса
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
} 