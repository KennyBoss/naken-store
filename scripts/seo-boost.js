// Генерация SEO данных для товаров
// JavaScript версия для использования в скриптах

// Генерация длинных семантических ключевых слов
function generateLongTailKeywords(product) {
  const keywords = []
  const name = product.name.toLowerCase()
  const category = product.category?.toLowerCase() || 'одежда'
  
  // Интент "купить" - высокая конверсия
  keywords.push(`купить ${name}`)
  keywords.push(`${name} купить онлайн`)
  keywords.push(`${name} интернет магазин`)
  keywords.push(`${name} с доставкой`)
  
  // Ценовые запросы
  if (product.price < 2000) {
    keywords.push(`${category} до 2000 рублей`)
    keywords.push(`недорогая ${category}`)
    keywords.push(`бюджетная ${category}`)
  } else if (product.price > 5000) {
    keywords.push(`премиум ${category}`)
    keywords.push(`дизайнерская ${category}`)
    keywords.push(`элитная ${category}`)
  }
  
  // Региональные запросы
  const cities = ['москва', 'спб', 'екатеринбург', 'казань', 'нижний новгород']
  keywords.push(`${category} ${cities[0]}`)
  keywords.push(`купить ${category} в ${cities[0]}`)
  
  // Old money стиль
  if (name.includes('old money') || name.includes('классик')) {
    keywords.push(`одежда в стиле old money`)
    keywords.push(`аристократический стиль одежды`)
    keywords.push(`элегантная классическая одежда`)
    keywords.push(`мужская одежда old money`)
    keywords.push(`стиль old money мужской`)
  }
  
  // Сезонные и трендовые запросы
  const currentYear = new Date().getFullYear()
  keywords.push(`${category} ${currentYear}`)
  keywords.push(`модная ${category} ${currentYear}`)
  keywords.push(`тренды ${category} ${currentYear}`)
  
  return keywords
}

// Генерация FAQ для товара
function generateProductFAQ(product) {
  const faqs = []
  
  // Размеры
  faqs.push({
    question: `Какие размеры есть у ${product.name}?`,
    answer: `${product.name} доступна в размерах S, M, L, XL. Воспользуйтесь нашей таблицей размеров для точного выбора.`
  })
  
  // Доставка
  faqs.push({
    question: `Сколько стоит доставка ${product.name}?`,
    answer: `Доставка ${product.name} бесплатна при заказе от 3000₽. Стандартная доставка по России - от 300₽. Экспресс-доставка по Москве в день заказа.`
  })
  
  // Качество и уход
  faqs.push({
    question: `Как ухаживать за ${product.name}?`,
    answer: `${product.name} изготовлена из качественных материалов. Рекомендуется машинная стирка при температуре 30°C, деликатный отжим.`
  })
  
  // Возврат
  faqs.push({
    question: `Можно ли вернуть ${product.name} если не подойдет?`,
    answer: `Да! Вы можете вернуть ${product.name} в течение 14 дней без объяснения причин. Примерка при получении, полный возврат средств.`
  })
  
  // Old Money стиль
  if (product.name.toLowerCase().includes('old money')) {
    faqs.push({
      question: `Что такое стиль old money?`,
      answer: `Стиль old money - это элегантная, сдержанная одежда высокого качества, отражающая аристократический вкус. ${product.name} идеально воплощает эту эстетику.`
    })
  }
  
  return faqs
}

// Генерация оптимизированных заголовков
function generateOptimizedTitles(product) {
  const brand = 'NAKEN Store'
  const price = product.salePrice || product.price
  const discount = product.salePrice ? 
    Math.round(((product.price - product.salePrice) / product.price) * 100) : 0
  
  const titles = [
    // Классический
    `${product.name} | ${brand}`,
    
    // С ценой
    `${product.name} за ${price.toLocaleString('ru-RU')}₽ | ${brand}`,
    
    // Со скидкой
    ...(discount > 0 ? [
      `${product.name} -${discount}% скидка | ${brand}`,
      `${product.name} от ${price.toLocaleString('ru-RU')}₽ скидка ${discount}% | ${brand}`
    ] : []),
    
    // С призывом к действию
    `Купить ${product.name} с доставкой | ${brand}`,
    `${product.name} - быстрая доставка по России | ${brand}`,
    
    // Эмоциональные
    `${product.name} - стильно и качественно | ${brand}`,
    `${product.name} - ваш идеальный выбор | ${brand}`,
    
    // Old Money специфичные
    ...(product.name.toLowerCase().includes('old money') ? [
      `${product.name} - аристократический стиль | ${brand}`,
      `${product.name} в стиле old money | ${brand}`,
      `Элегантная одежда old money | ${brand}`
    ] : [])
  ]
  
  return titles.filter(title => title.length <= 60) // SEO лимит
}

// Генерация meta описаний с эмоциональными триггерами
function generateEmotionalDescriptions(product) {
  const category = product.category || 'одежда'
  
  const descriptions = [
    `Почувствуйте уверенность в ${product.name}! Премиальное качество, стильный дизайн. Быстрая доставка по России. ✨`,
    
    `${product.name} - ваш секрет безупречного стиля. Создана для особенных моментов. Примерка при получении! 💫`,
    
    `Откройте для себя ${product.name} от NAKEN Store. Роскошь доступна каждому. Скидки до 50%, бесплатная доставка! 🚀`,
    
    `${product.name} - воплощение элегантности и комфорта. Присоединяйтесь к сообществу стильных людей NAKEN! ⭐`,
    
    `Эксклюзивная ${category} для ценителей качества. ${product.name} подчеркнет вашу индивидуальность. Заказать сейчас! 🎯`
  ]
  
  return descriptions.filter(desc => desc.length <= 160) // SEO лимит
}

// Основная функция генерации SEO данных
async function generateSEOData(product) {
  try {
    const keywords = generateLongTailKeywords(product)
    const faq = generateProductFAQ(product)
    const titles = generateOptimizedTitles(product)
    const descriptions = generateEmotionalDescriptions(product)
    
    return {
      title: titles[0], // Берем первый оптимизированный заголовок
      keywords: keywords.slice(0, 15).join(', '), // Первые 15 ключевых слов
      faq: faq,
      description: descriptions[0], // Первое описание
      
      // Дополнительные данные для будущего использования
      allTitles: titles,
      allDescriptions: descriptions,
      allKeywords: keywords
    }
    
  } catch (error) {
    console.error('Ошибка генерации SEO данных:', error)
    
    // Fallback базовые SEO данные
    return {
      title: `${product.name} | NAKEN Store`,
      keywords: `${product.name}, купить одежду, интернет магазин одежды, NAKEN Store`,
      faq: [
        {
          question: `Где купить ${product.name}?`,
          answer: `${product.name} можно купить в интернет-магазине NAKEN Store с быстрой доставкой по России.`
        }
      ],
      description: `${product.name} высокого качества от NAKEN Store. Быстрая доставка, примерка при получении, возврат 14 дней.`
    }
  }
}

module.exports = {
  generateSEOData,
  generateLongTailKeywords,
  generateProductFAQ,
  generateOptimizedTitles,
  generateEmotionalDescriptions
} 