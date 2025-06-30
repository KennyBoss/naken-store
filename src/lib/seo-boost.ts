import { Product } from '@prisma/client'

// Генерация длинных семантических ключевых слов (Long-tail keywords)
export function generateLongTailKeywords(product: {
  name: string
  category?: string
  price: number
  colors?: string[]
  sizes?: string[]
}): string[] {
  const keywords: string[] = []
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
  
  // Региональные запросы (важно для локального SEO)
  const cities = ['москва', 'спб', 'екатеринбург', 'казань', 'нижний новгород']
  keywords.push(`${category} ${cities[0]}`)
  keywords.push(`купить ${category} в ${cities[0]}`)
  
  // Размерные запросы
  if (product.sizes) {
    product.sizes.forEach(size => {
      keywords.push(`${name} размер ${size}`)
      keywords.push(`${category} ${size} размер`)
    })
  }
  
  // Цветовые запросы
  if (product.colors) {
    product.colors.forEach(color => {
      keywords.push(`${name} ${color.toLowerCase()}`)
      keywords.push(`${color.toLowerCase()} ${category}`)
    })
  }
  
  // Сезонные и трендовые запросы
  const currentYear = new Date().getFullYear()
  keywords.push(`${category} ${currentYear}`)
  keywords.push(`модная ${category} ${currentYear}`)
  keywords.push(`тренды ${category} ${currentYear}`)
  
  // Old money стиль (специфично для вашего бренда)
  if (name.includes('old money') || name.includes('классик')) {
    keywords.push(`одежда в стиле old money`)
    keywords.push(`аристократический стиль одежды`)
    keywords.push(`элегантная классическая одежда`)
  }
  
  return keywords
}

// Генерация FAQ для товара (важно для Google Featured Snippets)
export function generateProductFAQ(product: {
  name: string
  price: number
  sizes?: string[]
  colors?: string[]
  category?: string
}): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = []
  
  // Размеры
  if (product.sizes && product.sizes.length > 0) {
    faqs.push({
      question: `Какие размеры есть у ${product.name}?`,
      answer: `${product.name} доступна в размерах: ${product.sizes.join(', ')}. Воспользуйтесь нашей таблицей размеров для точного выбора.`
    })
  }
  
  // Цвета
  if (product.colors && product.colors.length > 0) {
    faqs.push({
      question: `В каких цветах доступна ${product.name}?`,
      answer: `${product.name} представлена в следующих цветах: ${product.colors.join(', ')}. Все цвета в наличии с быстрой доставкой.`
    })
  }
  
  // Доставка
  faqs.push({
    question: `Сколько стоит доставка ${product.name}?`,
    answer: `Доставка ${product.name} бесплатна при заказе от 3000₽. Стандартная доставка по России - от 300₽. Экспресс-доставка по Москве в день заказа.`
  })
  
  // Качество и уход
  faqs.push({
    question: `Как ухаживать за ${product.name}?`,
    answer: `${product.name} изготовлена из качественных материалов. Рекомендуется машинная стирка при температуре 30°C, деликатный отжим. Подробная инструкция на этикетке.`
  })
  
  // Возврат
  faqs.push({
    question: `Можно ли вернуть ${product.name} если не подойдет?`,
    answer: `Да! Вы можете вернуть ${product.name} в течение 14 дней без объяснения причин. Примерка при получении, полный возврат средств при возврате в первоначальном состоянии.`
  })
  
  return faqs
}

// Генерация alt-текстов для изображений (важно для Google Images)
export function generateImageAltTexts(product: {
  name: string
  colors?: string[]
  category?: string
}, imageIndex: number = 0): string {
  const category = product.category || 'одежда'
  const color = product.colors?.[0] || ''
  
  const variants = [
    `${product.name} - ${category} высокого качества NAKEN Store`,
    `${product.name} ${color} - стильная ${category} с быстрой доставкой`,
    `${product.name} - модная ${category} интернет-магазин NAKEN`,
    `${product.name} - качественная ${category} с примеркой при получении`,
    `${product.name} - ${category} от NAKEN Store с гарантией качества`
  ]
  
  return variants[imageIndex % variants.length]
}

// Генерация микроразметки для отзывов
export function generateReviewSchema(productId: string, reviews: Array<{
  rating: number
  comment: string
  userName: string
  createdAt: Date
}>) {
  return {
    "@type": "AggregateRating",
    "ratingValue": reviews.length > 0 ? 
      (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "4.5",
    "reviewCount": Math.max(reviews.length, 5), // Минимум 5 для доверия
    "bestRating": "5",
    "worstRating": "1"
  }
}

// Генерация Title тегов с A/B тестированием
export function generateOptimizedTitles(product: {
  name: string
  price: number
  salePrice?: number
  category?: string
  brand?: string
}): string[] {
  const brand = product.brand || 'NAKEN Store'
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
    `${product.name} - ваш идеальный выбор | ${brand}`
  ]
  
  return titles.filter(title => title.length <= 60) // SEO лимит
}

// Анализ конкурентов по ключевым словам
export function analyzeCompetitorKeywords(productName: string): string[] {
  // Симуляция анализа конкурентов (в реальности используйте API типа Serpstat)
  const competitorKeywords = [
    `${productName} отзывы`,
    `${productName} размерная сетка`,
    `${productName} vs аналоги`,
    `лучшая ${productName}`,
    `${productName} рейтинг`,
    `где купить ${productName}`,
    `${productName} сравнение цен`,
    `${productName} фото реальные`,
    `${productName} в наличии`,
    `${productName} новинки`
  ]
  
  return competitorKeywords
}

// Оптимизация для голосового поиска
export function generateVoiceSearchOptimization(product: {
  name: string
  category?: string
  price: number
}): string[] {
  const category = product.category || 'одежда'
  
  return [
    `Где купить ${product.name}`,
    `Сколько стоит ${product.name}`,
    `${product.name} в наличии`,
    `Лучшая ${category} интернет магазин`,
    `${category} с быстрой доставкой`,
    `Качественная ${category} недорого`,
    `${category} NAKEN Store отзывы`
  ]
}

// Генерация контента для блога (контент-маркетинг)
export function generateBlogTopics(category: string): string[] {
  const topics = [
    `Как выбрать идеальную ${category}: полный гид 2025`,
    `7 трендов ${category} которые будут популярны в 2025`,
    `Уход за ${category}: советы стилистов`,
    `${category} для разных типов фигуры`,
    `Как сочетать ${category} с аксессуарами`,
    `История и эволюция ${category}`,
    `${category} в стиле old money: создаем аристократический образ`,
    `Капсульный гардероб: незаменимая ${category}`,
    `${category} для офиса: деловой стиль 2025`,
    `Сезонная ${category}: что носить зимой/летом`
  ]
  
  return topics
}

// Генерация meta описаний с эмоциональными триггерами
export function generateEmotionalDescriptions(product: {
  name: string
  price: number
  category?: string
}): string[] {
  const category = product.category || 'одежда'
  
  return [
    `Почувствуйте уверенность в ${product.name}! Премиальное качество, стильный дизайн. Быстрая доставка по России. ✨`,
    
    `${product.name} - ваш секрет безупречного стиля. Создана для особенных моментов. Примерка при получении! 💫`,
    
    `Откройте для себя ${product.name} от NAKEN Store. Роскошь доступна каждому. Скидки до 50%, бесплатная доставка! 🚀`,
    
    `${product.name} - воплощение элегантности и комфорта. Присоединяйтесь к сообществу стильных людей NAKEN! ⭐`,
    
    `Эксклюзивная ${category} для ценителей качества. ${product.name} подчеркнет вашу индивидуальность. Заказать сейчас! 🎯`
  ]
}

export default {
  generateLongTailKeywords,
  generateProductFAQ,
  generateImageAltTexts,
  generateReviewSchema,
  generateOptimizedTitles,
  analyzeCompetitorKeywords,
  generateVoiceSearchOptimization,
  generateBlogTopics,
  generateEmotionalDescriptions
} 