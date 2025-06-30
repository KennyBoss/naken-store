const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function generateSitemap() {
  console.log('🗺️ Генерирую sitemap.xml для Яндекса...');
  
  try {
    const baseUrl = 'https://naken.store';
    
    // Получаем все опубликованные товары
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
    });
    
    console.log(`📦 Найдено товаров: ${products.length}`);
    
    // Статические страницы
    const staticPages = [
      { url: baseUrl, lastModified: new Date(), priority: '1.0', changeFreq: 'daily' },
      { url: `${baseUrl}/catalog`, lastModified: new Date(), priority: '0.9', changeFreq: 'daily' },
      { url: `${baseUrl}/contacts`, lastModified: new Date(), priority: '0.9', changeFreq: 'monthly' },
      { url: `${baseUrl}/delivery`, lastModified: new Date(), priority: '0.8', changeFreq: 'monthly' },
      { url: `${baseUrl}/payment`, lastModified: new Date(), priority: '0.8', changeFreq: 'monthly' },
      { url: `${baseUrl}/returns`, lastModified: new Date(), priority: '0.8', changeFreq: 'monthly' },
      { url: `${baseUrl}/terms`, lastModified: new Date(), priority: '0.6', changeFreq: 'yearly' },
      { url: `${baseUrl}/privacy`, lastModified: new Date(), priority: '0.6', changeFreq: 'yearly' },
      { url: `${baseUrl}/offer`, lastModified: new Date(), priority: '0.6', changeFreq: 'yearly' },
      { url: `${baseUrl}/intro`, lastModified: new Date(), priority: '0.5', changeFreq: 'monthly' },
    ];

    // Генерируем XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

    // Добавляем статические страницы
    staticPages.forEach((page) => {
      xml += `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified.toISOString()}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Добавляем товары
    products.forEach((product) => {
      xml += `  <url>
    <loc>${baseUrl}/product/${product.slug}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    xml += `</urlset>`;

    // Записываем в файл для проверки
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml, 'utf8');
    
    console.log(`✅ Sitemap сохранен: ${sitemapPath}`);
    console.log(`📄 Всего URL в sitemap: ${staticPages.length + products.length}`);
    console.log(`📦 Товаров в sitemap: ${products.length}`);
    console.log(`📋 Статических страниц: ${staticPages.length}`);
    
    // Показываем примеры товаров
    if (products.length > 0) {
      console.log('\n🔗 Примеры товаров в sitemap:');
      products.slice(0, 5).forEach(product => {
        console.log(`   ${baseUrl}/product/${product.slug}`);
      });
      if (products.length > 5) {
        console.log(`   ... и еще ${products.length - 5} товаров`);
      }
    }

    return { success: true, totalUrls: staticPages.length + products.length, products: products.length };
    
  } catch (error) {
    console.error('❌ Ошибка генерации sitemap:', error);
    return { success: false, error: error.message };
  }
}

// Проверка товаров в базе
async function checkProducts() {
  console.log('🔍 Проверяю товары в базе данных...');
  
  try {
    const total = await prisma.product.count();
    const published = await prisma.product.count({ where: { published: true } });
    const withSlug = await prisma.product.count({ 
      where: { 
        published: true,
        slug: { not: null },
        NOT: { slug: '' }
      } 
    });
    
    console.log(`📊 Статистика товаров:`);
    console.log(`   Всего товаров: ${total}`);
    console.log(`   Опубликованных: ${published}`);
    console.log(`   С корректным slug: ${withSlug}`);
    
    if (withSlug > 0) {
      const sampleProducts = await prisma.product.findMany({
        where: { 
          published: true,
          slug: { not: null },
          NOT: { slug: '' }
        },
        select: {
          name: true,
          slug: true,
          updatedAt: true
        },
        take: 3
      });
      
      console.log('\n📝 Примеры товаров:');
      sampleProducts.forEach(product => {
        console.log(`   "${product.name}" -> /product/${product.slug}`);
      });
    }
    
    return { total, published, withSlug };
    
  } catch (error) {
    console.error('❌ Ошибка проверки товаров:', error);
    return { error: error.message };
  }
}

// CLI интерфейс
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      await checkProducts();
      break;
      
    case 'generate':
      const result = await generateSitemap();
      if (result.success) {
        console.log('\n🎉 Sitemap успешно сгенерирован!');
        console.log('📋 Для загрузки на сервер скопируйте файл public/sitemap.xml');
      }
      break;
      
    case 'full':
      console.log('🔍 Полная проверка и генерация...\n');
      await checkProducts();
      console.log('\n' + '='.repeat(50) + '\n');
      await generateSitemap();
      break;
      
    default:
      console.log(`
🗺️ Генератор sitemap для NAKEN Store

Использование:
  node scripts/generate-sitemap.js check     - Проверить товары в базе
  node scripts/generate-sitemap.js generate - Сгенерировать sitemap.xml
  node scripts/generate-sitemap.js full     - Полная проверка + генерация

Для Яндекса важно:
  ✅ Все товары должны быть в sitemap
  ✅ Правильный XML формат
  ✅ Актуальные даты lastmod
  ✅ Корректные приоритеты для товаров (0.8)

Примеры:
  node scripts/generate-sitemap.js check
  node scripts/generate-sitemap.js full
      `);
  }
  
  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateSitemap, checkProducts }; 