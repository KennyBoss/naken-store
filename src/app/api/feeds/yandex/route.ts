import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Helper to escape XML special characters
const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        published: true,
      },
      include: {
        sizes: {
          include: {
            size: true,
          },
        },
        color: true,
      },
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://naken.store'
    const siteName = 'Naken';
    const companyName = 'Naken Store';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${new Date().toISOString()}">
  <shop>
    <name>${escapeXml(siteName)}</name>
    <company>${escapeXml(companyName)}</company>
    <url>${siteUrl}</url>
    <currencies>
      <currency id="RUR" rate="1"/>
    </currencies>
    <categories>
      <category id="1">Все товары</category>
    </categories>
    <offers>
`

    for (const product of products) {
      const productUrl = `${siteUrl}/product/${product.slug}`
      const price = product.salePrice || product.price
      const oldPrice = product.salePrice ? product.price : undefined
      const images = JSON.parse(product.images as string) as string[]

      // Use the first image or a placeholder
      const mainImage = images.length > 0 ? `${siteUrl}${images[0]}` : `${siteUrl}/placeholder.jpg`
      
      const offerId = escapeXml(product.sku)

      xml += `
      <offer id="${offerId}" available="${product.stock > 0 ? 'true' : 'false'}">
        <url>${productUrl}</url>
        <price>${price}</price>
        ${oldPrice ? `<oldprice>${oldPrice}</oldprice>` : ''}
        <currencyId>RUR</currencyId>
        <categoryId>1</categoryId>
        <picture>${mainImage}</picture>
        ${images.slice(1).map(img => `<picture>${siteUrl}${img}</picture>`).join('\n        ')}
        <name>${escapeXml(product.name)}</name>
        <description><![CDATA[${product.description || ''}]]></description>
        <vendorCode>${escapeXml(product.sku)}</vendorCode>
        <param name="Цвет">${escapeXml(product.color?.name || 'N/A')}</param>
        ${product.sizes.map(s => `<param name="Размер">${escapeXml(s.size.russianSize)}</param>`).join('\n        ')}
      </offer>
`
    }

    xml += `
    </offers>
  </shop>
</yml_catalog>`

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Ошибка генерации Yandex фида:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Внутренняя ошибка сервера при генерации фида' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
} 