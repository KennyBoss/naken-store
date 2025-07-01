const fs = require('fs');
const path = require('path');

// Исправление sitemap роута для правильного XML форматирования
function createProperXMLSitemapRoute() {
  const routeContent = `import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const baseUrl = 'https://naken.store'
  
  try {
    console.log('🗺️ Генерирую sitemap.xml...')
    
    // Получаем товары
    const products = await prisma.product.findMany({
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
      orderBy: {
        updatedAt: 'desc'
      }
    })
    
    console.log(\`📦 Найдено товаров для sitemap: \${products.length}\`)
    
    // Статические страницы
    const staticPages = [
      { url: baseUrl, lastModified: new Date(), priority: '1.0', changeFreq: 'daily' },
      { url: \`\${baseUrl}/catalog\`, lastModified: new Date(), priority: '0.9', changeFreq: 'daily' },
      { url: \`\${baseUrl}/contacts\`, lastModified: new Date(), priority: '0.9', changeFreq: 'monthly' },
      { url: \`\${baseUrl}/delivery\`, lastModified: new Date(), priority: '0.8', changeFreq: 'monthly' },
      { url: \`\${baseUrl}/payment\`, lastModified: new Date(), priority: '0.8', changeFreq: 'monthly' },
      { url: \`\${baseUrl}/returns\`, lastModified: new Date(), priority: '0.8', changeFreq: 'monthly' },
      { url: \`\${baseUrl}/terms\`, lastModified: new Date(), priority: '0.6', changeFreq: 'yearly' },
      { url: \`\${baseUrl}/privacy\`, lastModified: new Date(), priority: '0.6', changeFreq: 'yearly' },
      { url: \`\${baseUrl}/offer\`, lastModified: new Date(), priority: '0.6', changeFreq: 'yearly' },
      { url: \`\${baseUrl}/intro\`, lastModified: new Date(), priority: '0.5', changeFreq: 'monthly' },
    ]

    // ПРАВИЛЬНАЯ генерация XML
    let xml = \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
\`

    // Добавляем статические страницы с ПРАВИЛЬНЫМИ тегами
    staticPages.forEach((page) => {
      xml += \`  <url>
    <loc>\${page.url}</loc>
    <lastmod>\${page.lastModified.toISOString()}</lastmod>
    <changefreq>\${page.changeFreq}</changefreq>
    <priority>\${page.priority}</priority>
  </url>
\`
    })

    // Добавляем товары с ПРАВИЛЬНЫМИ тегами
    products.forEach((product) => {
      xml += \`  <url>
    <loc>\${baseUrl}/product/\${product.slug}</loc>
    <lastmod>\${product.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
\`
    })

    // Закрываем XML
    xml += \`</urlset>\`
    
    console.log(\`✅ Sitemap сгенерирован: \${staticPages.length + products.length} URL\`)
    console.log(\`📏 Размер XML: \${xml.length} символов\`)

    // КРИТИЧНО: Правильные headers для XML
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1 час кэш
        'X-Robots-Tag': 'noindex',
        'Access-Control-Allow-Origin': '*',
      }
    })
    
  } catch (error) {
    console.error('❌ Ошибка генерации sitemap:', error)
    
    // Fallback XML sitemap
    const fallbackXml = \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>\${baseUrl}</loc>
    <lastmod>\${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>\${baseUrl}/catalog</loc>
    <lastmod>\${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>\`
    
    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache',
      }
    })
  } finally {
    await prisma.$disconnect()
  }
}

// Дополнительная функция для robots.txt (если нужно)
export async function generateRobotsTxt() {
  return \`User-agent: *
Allow: /

# Sitemaps
Sitemap: https://naken.store/sitemap.xml

# Яндекс специфичные директивы  
User-agent: Yandex
Allow: /

# Блокируем админку и API
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /_next/
Disallow: /scripts/

# Разрешаем важные страницы для SEO
Allow: /catalog
Allow: /product/
Allow: /contacts
Allow: /delivery

# Дополнительная информация для поисковиков
Host: https://naken.store
Clean-param: utm_source&utm_medium&utm_campaign&fbclid&gclid
\`
}
`;

  return routeContent;
}

// Основная функция исправления
async function fixXMLFormat() {
  console.log('🔧 Исправляю XML форматирование sitemap...');
  
  try {
    // Создаем новый роут с правильным XML
    const newRouteContent = createProperXMLSitemapRoute();
    const routePath = path.join(process.cwd(), 'src', 'app', 'sitemap.xml', 'route.ts');
    
    // Создаем бэкап
    const backupPath = routePath + '.xml-backup';
    if (fs.existsSync(routePath)) {
      fs.copyFileSync(routePath, backupPath);
      console.log(`💾 Создан бэкап: ${backupPath}`);
    }
    
    // Записываем исправленный роут
    fs.writeFileSync(routePath, newRouteContent, 'utf8');
    console.log(`✅ Обновлен файл: ${routePath}`);
    
    console.log('\n🎉 XML форматирование исправлено!');
    console.log('📋 Изменения:');
    console.log('   ✅ Правильные XML теги <url>, <loc>, <lastmod>');
    console.log('   ✅ Правильный Content-Type: application/xml');
    console.log('   ✅ Увеличенный кэш до 1 часа');
    console.log('   ✅ Поддержка Яндекс и Google');
    
    console.log('\n📋 Что делать дальше:');
    console.log('   1. pm2 restart naken-store');
    console.log('   2. curl https://naken.store/sitemap.xml | head -10');
    console.log('   3. Проверить XML теги в браузере');
    console.log('   4. Добавить в Яндекс.Вебмастер и Google Search Console');
    
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка исправления XML:', error);
    return false;
  }
}

// Проверка текущего sitemap
async function checkCurrentSitemap() {
  console.log('🔍 Проверяю текущий sitemap...');
  
  try {
    const routePath = path.join(process.cwd(), 'src', 'app', 'sitemap.xml', 'route.ts');
    
    if (!fs.existsSync(routePath)) {
      console.log('❌ Файл sitemap роута не найден!');
      return false;
    }
    
    const content = fs.readFileSync(routePath, 'utf8');
    
    // Проверяем наличие ключевых элементов
    const hasXMLDeclaration = content.includes('<?xml version="1.0"');
    const hasURLTags = content.includes('<url>') && content.includes('</url>');
    const hasLocTags = content.includes('<loc>') && content.includes('</loc>');
    const hasProperHeaders = content.includes('application/xml');
    
    console.log('📊 Анализ текущего sitemap:');
    console.log(`   ${hasXMLDeclaration ? '✅' : '❌'} XML декларация`);
    console.log(`   ${hasURLTags ? '✅' : '❌'} URL теги`);
    console.log(`   ${hasLocTags ? '✅' : '❌'} LOC теги`);
    console.log(`   ${hasProperHeaders ? '✅' : '❌'} XML Content-Type`);
    
    const needsFix = !hasXMLDeclaration || !hasURLTags || !hasLocTags || !hasProperHeaders;
    
    if (needsFix) {
      console.log('\n⚠️ Требуется исправление XML форматирования');
    } else {
      console.log('\n✅ Sitemap выглядит корректно');
    }
    
    return !needsFix;
    
  } catch (error) {
    console.error('❌ Ошибка проверки sitemap:', error);
    return false;
  }
}

// CLI интерфейс
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      await checkCurrentSitemap();
      break;
      
    case 'fix':
      await fixXMLFormat();
      break;
      
    case 'full':
      console.log('🔧 Полное исправление XML форматирования...\n');
      await checkCurrentSitemap();
      console.log('\n' + '='.repeat(50) + '\n');
      await fixXMLFormat();
      break;
      
    default:
      console.log(`
🔧 Исправление XML форматирования sitemap

Проблема:
  ❌ Яндекс видит плоский текст вместо XML
  ❌ Отсутствуют теги <url>, <loc>, <lastmod>
  ❌ Неправильный Content-Type

Использование:
  node scripts/fix-sitemap-xml-format.js check  - Проверить текущий sitemap
  node scripts/fix-sitemap-xml-format.js fix    - Исправить XML форматирование
  node scripts/fix-sitemap-xml-format.js full   - Полное исправление

Примеры:
  node scripts/fix-sitemap-xml-format.js full
  pm2 restart naken-store
  curl https://naken.store/sitemap.xml | head -10

После исправления Яндекс увидит:
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://naken.store</loc>
      <lastmod>2025-06-30T21:22:29.696Z</lastmod>
      ...
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixXMLFormat, checkCurrentSitemap, createProperXMLSitemapRoute }; 