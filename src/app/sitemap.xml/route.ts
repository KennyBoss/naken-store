import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const baseUrl = 'https://naken.store'
  
  let products: any[] = []
  
  try {
    // Получаем товары с более консервативным подходом для Яндекса
    products = await prisma.product.findMany({
      where: {
        published: true,
        slug: {
          not: null,
        },
        NOT: {
          slug: ''
        }
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      take: 500 // Ограничиваем для стабильности Яндекса
    })
  } catch (error) {
    console.error('Sitemap XML: Database error -', error)
    products = []
  }

  // Генерируем XML вручную для максимальной совместимости с Яндексом
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: '1.0', changeFreq: 'daily' },
    { url: `${baseUrl}/catalog`, lastModified: new Date(), priority: '0.9', changeFreq: 'daily' },
    { url: `${baseUrl}/contacts`, lastModified: new Date(), priority: '0.9', changeFreq: 'monthly' },
    { url: `${baseUrl}/delivery`, lastModified: new Date(), priority: '0.8', changeFreq: 'monthly' },
    { url: `${baseUrl}/payment`, lastModified: new Date(), priority: '0.8', changeFreq: 'monthly' },
    { url: `${baseUrl}/returns`, lastModified: new Date(), priority: '0.8', changeFreq: 'monthly' },
    { url: `${baseUrl}/cart`, lastModified: new Date(), priority: '0.7', changeFreq: 'weekly' },
    { url: `${baseUrl}/checkout`, lastModified: new Date(), priority: '0.7', changeFreq: 'weekly' },
    { url: `${baseUrl}/terms`, lastModified: new Date(), priority: '0.6', changeFreq: 'yearly' },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), priority: '0.6', changeFreq: 'yearly' },
    { url: `${baseUrl}/offer`, lastModified: new Date(), priority: '0.6', changeFreq: 'yearly' },
    { url: `${baseUrl}/intro`, lastModified: new Date(), priority: '0.5', changeFreq: 'monthly' },
  ]

  // Собираем XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`

  // Добавляем статические страницы
  staticPages.forEach((page) => {
    xml += `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified.toISOString()}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
  })

  // Добавляем товары
  products.forEach((product) => {
    xml += `  <url>
    <loc>${baseUrl}/product/${product.slug}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
  })

  xml += `</urlset>`

  // Возвращаем с правильными headers для Яндекса
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Robots-Tag': 'noindex',
    }
  })
} 