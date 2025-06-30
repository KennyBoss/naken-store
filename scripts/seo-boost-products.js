const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Функции из seo-boost.ts (адаптированы для Node.js)
function generateLongTailKeywords(product) {
  const keywords = []
  const name = product.name.toLowerCase()
  const category = 'одежда'
  
  // Основные коммерческие запросы
  keywords.push(`купить ${name}`)
  keywords.push(`${name} купить онлайн`)
  keywords.push(`${name} интернет магазин`)
  keywords.push(`${name} с доставкой`)
  keywords.push(`${name} NAKEN Store`)
  
  // Ценовые запросы
  if (product.price < 2000) {
    keywords.push(`${category} до 2000 рублей`)
    keywords.push(`недорогая ${category}`)
  } else if (product.price > 5000) {
    keywords.push(`премиум ${category}`)
    keywords.push(`дизайнерская ${category}`)
  }
  
  // Региональные запросы
  keywords.push(`${category} москва`)
  keywords.push(`купить ${category} в москве`)
  
  // Old money стиль
  if (name.includes('old money') || name.includes('классик')) {
    keywords.push(`одежда в стиле old money`)
    keywords.push(`аристократический стиль одежды`)
    keywords.push(`элегантная классическая одежда`)
  }
  
  return keywords.join(', ')
}

function generateOptimizedTitle(product) {
  const price = product.salePrice || product.price
  const discount = product.salePrice ? 
    Math.round(((product.price - product.salePrice) / product.price) * 100) : 0
  
  // Варианты title с учетом лимита в 60 символов
  const variants = [
    `${product.name} | NAKEN Store`,
    `${product.name} за ${price.toLocaleString('ru-RU')}₽ | NAKEN`,
    ...(discount > 0 ? [`${product.name} -${discount}% | NAKEN Store`] : []),
    `Купить ${product.name} | NAKEN Store`
  ]
  
  // Выбираем самый короткий, но информативный
  return variants.find(title => title.length <= 60) || variants[0]
}

function generateSEODescription(product) {
  const price = product.salePrice || product.price
  const benefits = [
    'высокое качество',
    'быстрая доставка по России',
    'возврат 14 дней',
    'примерка при получении'
  ]
  
  if (product.salePrice) {
    const discount = Math.round(((product.price - product.salePrice) / product.price) * 100)
    benefits.unshift(`скидка ${discount}%`)
  }
  
  let description = `${product.name} в интернет-магазине NAKEN Store за ${price.toLocaleString('ru-RU')}₽. `
  description += `${benefits.join(', ').replace(/^./, str => str.toUpperCase())}.`
  
  // Добавляем эмоциональный призыв
  const emotional = [
    ' Почувствуйте уверенность в стильной одежде!',
    ' Воплощение элегантности и комфорта.',
    ' Ваш секрет безупречного стиля.'
  ]
  
  if (description.length < 130) {
    description += emotional[Math.floor(Math.random() * emotional.length)]
  }
  
  return description.slice(0, 160) // SEO лимит
}

function generateProductFAQ(product) {
  const faqs = []
  
  // Базовые FAQ для всех товаров
  faqs.push({
    question: `Сколько стоит доставка ${product.name}?`,
    answer: `Доставка ${product.name} бесплатна при заказе от 3000₽. Стандартная доставка по России - от 300₽.`
  })
  
  faqs.push({
    question: `Можно ли вернуть ${product.name}?`,
    answer: `Да! Возврат ${product.name} в течение 14 дней без объяснения причин. Примерка при получении.`
  })
  
  faqs.push({
    question: `Как ухаживать за ${product.name}?`,
    answer: `${product.name} рекомендуется стирать при 30°C, деликатный отжим. Подробная инструкция на этикетке.`
  })
  
  return JSON.stringify(faqs)
}

// Основная функция оптимизации
async function optimizeProductSEO(productId) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        color: true,
        sizes: {
          include: { size: true }
        }
      }
    })
    
    if (!product) {
      console.log(`❌ Товар с ID ${productId} не найден`)
      return
    }
    
    // Генерируем SEO-данные
    const optimizedTitle = generateOptimizedTitle(product)
    const seoDescription = generateSEODescription(product)
    const keywords = generateLongTailKeywords(product)
    const faq = generateProductFAQ(product)
    
    // Обновляем товар
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        seoTitle: optimizedTitle,
        description: seoDescription,
        seoKeywords: keywords,
        faq: faq,
        // Обновляем timestamp для индексации
        updatedAt: new Date()
      }
    })
    
    console.log(`✅ Товар "${product.name}" оптимизирован:`)
    console.log(`   📝 Title: ${optimizedTitle}`)
    console.log(`   📄 Description: ${seoDescription.slice(0, 100)}...`)
    console.log(`   🔍 Keywords: ${keywords.split(', ').length} штук`)
    console.log(`   ❓ FAQ: ${JSON.parse(faq).length} вопросов`)
    
    return updatedProduct
  } catch (error) {
    console.error(`❌ Ошибка оптимизации товара ${productId}:`, error)
  }
}

// Массовая оптимизация всех товаров
async function optimizeAllProducts() {
  console.log('🚀 Начинаем массовую SEO-оптимизацию товаров...')
  
  const products = await prisma.product.findMany({
    where: { published: true },
    select: { id: true, name: true }
  })
  
  console.log(`📦 Найдено ${products.length} опубликованных товаров`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const product of products) {
    try {
      await optimizeProductSEO(product.id)
      successCount++
      
      // Пауза между запросами для избежания перегрузки
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      errorCount++
      console.error(`❌ Ошибка с товаром ${product.name}:`, error.message)
    }
  }
  
  console.log('\n📊 РЕЗУЛЬТАТЫ ОПТИМИЗАЦИИ:')
  console.log(`✅ Успешно: ${successCount} товаров`)
  console.log(`❌ Ошибки: ${errorCount} товаров`)
  console.log(`📈 Готово! Все товары оптимизированы для поисковых систем`)
}

// Оптимизация конкретного товара по slug
async function optimizeProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug: slug }
  })
  
  if (!product) {
    console.log(`❌ Товар с slug "${slug}" не найден`)
    return
  }
  
  return await optimizeProductSEO(product.id)
}

// Генерация отчета по SEO
async function generateSEOReport() {
  console.log('📊 Генерируем SEO-отчет...')
  
  const products = await prisma.product.findMany({
    where: { published: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      seoTitle: true,
      seoKeywords: true,
      price: true,
      salePrice: true,
      views: true
    }
  })
  
  const report = {
    totalProducts: products.length,
    withSEOTitle: products.filter(p => p.seoTitle).length,
    withDescription: products.filter(p => p.description && p.description.length > 50).length,
    withKeywords: products.filter(p => p.seoKeywords).length,
    avgDescriptionLength: Math.round(
      products.reduce((sum, p) => sum + (p.description?.length || 0), 0) / products.length
    ),
    topProducts: products
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10)
      .map(p => ({
        name: p.name,
        slug: p.slug,
        views: p.views || 0,
        hasSEO: !!(p.seoTitle && p.description && p.seoKeywords)
      }))
  }
  
  console.log('\n📈 SEO ОТЧЕТ:')
  console.log(`📦 Всего товаров: ${report.totalProducts}`)
  console.log(`📝 С SEO Title: ${report.withSEOTitle} (${Math.round(report.withSEOTitle / report.totalProducts * 100)}%)`)
  console.log(`📄 С описанием: ${report.withDescription} (${Math.round(report.withDescription / report.totalProducts * 100)}%)`)
  console.log(`🔍 С ключевыми словами: ${report.withKeywords} (${Math.round(report.withKeywords / report.totalProducts * 100)}%)`)
  console.log(`📏 Средняя длина описания: ${report.avgDescriptionLength} символов`)
  
  console.log('\n🏆 ТОП-10 товаров по просмотрам:')
  report.topProducts.forEach((product, index) => {
    const seoStatus = product.hasSEO ? '✅' : '❌'
    console.log(`${index + 1}. ${product.name} - ${product.views} просмотров ${seoStatus}`)
  })
  
  return report
}

// CLI интерфейс
async function main() {
  const command = process.argv[2]
  const argument = process.argv[3]
  
  switch (command) {
    case 'all':
      await optimizeAllProducts()
      break
      
    case 'product':
      if (!argument) {
        console.log('❌ Укажите ID товара: node seo-boost-products.js product <id>')
        return
      }
      await optimizeProductSEO(parseInt(argument))
      break
      
    case 'slug':
      if (!argument) {
        console.log('❌ Укажите slug товара: node seo-boost-products.js slug <slug>')
        return
      }
      await optimizeProductBySlug(argument)
      break
      
    case 'report':
      await generateSEOReport()
      break
      
    default:
      console.log(`
🚀 NAKEN SEO Optimizer

Использование:
  node seo-boost-products.js all           - Оптимизировать все товары
  node seo-boost-products.js product <id>  - Оптимизировать товар по ID
  node seo-boost-products.js slug <slug>   - Оптимизировать товар по slug
  node seo-boost-products.js report       - Показать SEO отчет

Примеры:
  node seo-boost-products.js all
  node seo-boost-products.js product 1
  node seo-boost-products.js slug futbolka-old-money
  node seo-boost-products.js report
      `)
  }
  
  await prisma.$disconnect()
}

// Проверяем что скрипт запущен напрямую
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  optimizeProductSEO,
  optimizeAllProducts,
  generateSEOReport,
  optimizeProductBySlug
} 