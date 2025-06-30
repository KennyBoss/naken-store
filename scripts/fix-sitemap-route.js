const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Тест подключения к базе данных
async function testDatabaseConnection() {
  console.log('🔍 Тестирую подключение к базе данных...');
  
  try {
    // Проверяем подключение
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Подключение к базе работает');
    
    // Проверяем товары
    const productCount = await prisma.product.count();
    console.log(`📦 Товаров в базе: ${productCount}`);
    
    if (productCount > 0) {
      const sample = await prisma.product.findFirst({
        where: { published: true },
        select: { name: true, slug: true }
      });
      console.log(`📝 Пример товара: "${sample?.name}" -> ${sample?.slug}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к базе:', error.message);
    return false;
  }
}

// Создание исправленного sitemap роута
function createFixedSitemapRoute() {
  const routeContent = `import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const baseUrl = 'https://naken.store'
  
  try {
    console.log('🗺️ Генерирую sitemap.xml...')
    
    // Получаем товары с более надежным подключением
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

    // Генерируем XML
    let xml = \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
\`

    // Добавляем статические страницы
    staticPages.forEach((page) => {
      xml += \`  <url>
    <loc>\${page.url}</loc>
    <lastmod>\${page.lastModified.toISOString()}</lastmod>
    <changefreq>\${page.changeFreq}</changefreq>
    <priority>\${page.priority}</priority>
  </url>
\`
    })

    // Добавляем товары
    products.forEach((product) => {
      xml += \`  <url>
    <loc>\${baseUrl}/product/\${product.slug}</loc>
    <lastmod>\${product.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
\`
    })

    xml += \`</urlset>\`
    
    console.log(\`✅ Sitemap сгенерирован: \${staticPages.length + products.length} URL\`)

    // Возвращаем с правильными headers
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Кэш на 5 минут
        'X-Robots-Tag': 'noindex',
      }
    })
    
  } catch (error) {
    console.error('❌ Ошибка генерации sitemap:', error)
    
    // Fallback sitemap только со статическими страницами
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
`;

  return routeContent;
}

// Основная функция исправления
async function fixSitemapRoute() {
  console.log('🔧 Исправляю динамический sitemap роут...');
  
  try {
    // Тестируем подключение к базе
    const dbWorking = await testDatabaseConnection();
    if (!dbWorking) {
      console.log('⚠️ База данных недоступна, создаю fallback sitemap');
    }
    
    // Создаем исправленный роут
    const newRouteContent = createFixedSitemapRoute();
    const routePath = path.join(process.cwd(), 'src', 'app', 'sitemap.xml', 'route.ts');
    
    // Создаем бэкап старого файла
    const backupPath = routePath + '.backup';
    if (fs.existsSync(routePath)) {
      fs.copyFileSync(routePath, backupPath);
      console.log(`💾 Создан бэкап: ${backupPath}`);
    }
    
    // Записываем новый роут
    fs.writeFileSync(routePath, newRouteContent, 'utf8');
    console.log(`✅ Обновлен файл: ${routePath}`);
    
    // Удаляем статический sitemap (может конфликтовать)
    const staticSitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    if (fs.existsSync(staticSitemapPath)) {
      fs.unlinkSync(staticSitemapPath);
      console.log('🗑️ Удален конфликтующий public/sitemap.xml');
    }
    
    console.log('\n🎉 Sitemap роут исправлен!');
    console.log('📋 Что делать дальше:');
    console.log('   1. pm2 restart naken-store');
    console.log('   2. curl https://naken.store/sitemap.xml');
    console.log('   3. Проверить что товары появились');
    
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка исправления sitemap:', error);
    return false;
  }
}

// Очистка кэша Next.js
async function clearNextJSCache() {
  console.log('🧹 Очищаю кэш Next.js...');
  
  try {
    const cacheDir = path.join(process.cwd(), '.next', 'cache');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
      console.log('✅ Кэш Next.js очищен');
    }
    
    // Очищаем папку server
    const serverDir = path.join(process.cwd(), '.next', 'server');
    if (fs.existsSync(serverDir)) {
      fs.rmSync(serverDir, { recursive: true, force: true });
      console.log('✅ Серверный кэш очищен');
    }
    
    return true;
  } catch (error) {
    console.error('⚠️ Ошибка очистки кэша:', error.message);
    return false;
  }
}

// CLI интерфейс
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      await testDatabaseConnection();
      break;
      
    case 'fix':
      await fixSitemapRoute();
      break;
      
    case 'clear-cache':
      await clearNextJSCache();
      break;
      
    case 'full':
      console.log('🔧 Полное исправление sitemap...\n');
      await testDatabaseConnection();
      console.log('\n' + '='.repeat(50) + '\n');
      await fixSitemapRoute();
      console.log('\n' + '='.repeat(50) + '\n');
      await clearNextJSCache();
      break;
      
    default:
      console.log(`
🔧 Исправление sitemap для NAKEN Store

Использование:
  node scripts/fix-sitemap-route.js test        - Тест подключения к базе
  node scripts/fix-sitemap-route.js fix         - Исправить sitemap роут
  node scripts/fix-sitemap-route.js clear-cache - Очистить кэш Next.js
  node scripts/fix-sitemap-route.js full        - Полное исправление

Проблема:
  ❌ Sitemap показывает только служебные страницы
  ❌ Товары не попадают в sitemap
  ❌ Next.js кэширует старую версию

Решение:
  ✅ Исправляем динамический роут src/app/sitemap.xml/route.ts
  ✅ Добавляем надежное подключение к базе
  ✅ Очищаем кэш для обновления

Примеры:
  node scripts/fix-sitemap-route.js full
  pm2 restart naken-store
  curl https://naken.store/sitemap.xml
      `);
  }
  
  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixSitemapRoute, testDatabaseConnection, clearNextJSCache }; 