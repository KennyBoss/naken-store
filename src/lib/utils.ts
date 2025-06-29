import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Форматирование цены
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Валидация email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Генерация случайного ID для заказов
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

// Форматирование даты
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

// Форматирование даты и времени
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Вычисление скидки в процентах
export function calculateDiscountPercent(originalPrice: number, salePrice: number): number {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

// Truncate текст
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Slug из строки
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // убираем специальные символы
    .replace(/[\s_-]+/g, '-') // заменяем пробелы и подчеркивания на дефисы
    .replace(/^-+|-+$/g, '') // убираем дефисы в начале и конце
}

// Транслитерация кириллицы в латиницу
export function transliterate(text: string): string {
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
    'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
    'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
    'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch',
    'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
    'э': 'e', 'ю': 'yu', 'я': 'ya'
  }

  return text
    .toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
}

// Создание SEO-friendly slug для товара
export function createProductSlug(name: string, options?: {
  sizes?: string[]
  colors?: string[]
  category?: string
  brand?: string
  sku?: string
}): string {
  // Предварительная очистка названия
  const cleanName = name
    .replace(/[^\w\s-а-яё]/gi, '') // оставляем только буквы, цифры, пробелы и дефисы
    .replace(/\s+/g, ' ') // убираем множественные пробелы
    .trim()

  // Базовый slug из названия с транслитерацией
  let baseSlug = transliterate(cleanName)
    .replace(/[^a-z0-9\s-]/g, '') // только латиница, цифры, пробелы и дефисы
    .replace(/\s+/g, '-') // пробелы в дефисы
    .replace(/-+/g, '-') // убираем повторяющиеся дефисы
    .replace(/^-+|-+$/g, '') // убираем дефисы в начале и конце

  // Если слаг получился слишком коротким, добавляем информацию
  if (baseSlug.length < 3) {
    baseSlug = 'product'
  }

  // Добавляем категорию если есть (для лучшего SEO)
  if (options?.category) {
    const categorySlug = transliterate(options.category)
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 10) // ограничиваем длину
    
    if (categorySlug && categorySlug.length >= 2) {
      baseSlug = categorySlug + '-' + baseSlug
    }
  }

  // Добавляем основной размер если есть (только один, самый популярный)
  if (options?.sizes && options.sizes.length > 0) {
    // Приоритет размеров для одежды (самые популярные первыми)
    const sizesPriority = ['m', 'l', 's', 'xl', 'xs', 'xxl']
    let selectedSize = options.sizes[0] // по умолчанию первый
    
    // Ищем размер из приоритетного списка
    for (const priority of sizesPriority) {
      const found = options.sizes.find(size => 
        size.toLowerCase().includes(priority)
      )
      if (found) {
        selectedSize = found
        break
      }
    }

    const sizeSlug = transliterate(selectedSize)
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 5) // ограничиваем длину размера
    
    if (sizeSlug && sizeSlug.length >= 1) {
      baseSlug += '-' + sizeSlug
    }
  }

  // Добавляем основной цвет если есть (только один)
  if (options?.colors && options.colors.length > 0) {
    const colorSlug = transliterate(options.colors[0])
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 8) // ограничиваем длину цвета
    
    if (colorSlug && colorSlug.length >= 2) {
      baseSlug += '-' + colorSlug
    }
  }

  // Добавляем часть SKU для уникальности если нужно
  if (options?.sku) {
    const skuSlug = options.sku
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(-4) // берем последние 4 символа
    
    if (skuSlug.length >= 2) {
      baseSlug += '-' + skuSlug
    }
  }

  // Финальная очистка и ограничение длины
  const finalSlug = baseSlug
    .replace(/-+/g, '-') // убираем повторяющиеся дефисы
    .replace(/^-+|-+$/g, '') // убираем дефисы в начале и конце
    .slice(0, 100) // ограничиваем максимальную длину

  return finalSlug || 'product'
}

// Упрощенная функция для создания базового slug (обратная совместимость)
export function createSimpleProductSlug(name: string, sizes?: string[], colors?: string[]): string {
  return createProductSlug(name, { sizes, colors })
}

// SEO-оптимизация описаний товаров
export function generateSEODescription(product: {
  name: string
  description?: string | null
  price: number
  salePrice?: number | null
  sizes?: string[]
  colors?: string[]
  category?: string
  brand?: string
  sku?: string
}): string {
  // Если есть кастомное описание и оно достаточно длинное, используем его
  if (product.description && product.description.length >= 50) {
    return truncateToSEOLength(product.description)
  }

  // Автогенерация SEO-описания
  const parts: string[] = []
  
  // Начинаем с названия товара
  parts.push(product.name)
  
  // Добавляем размеры если есть
  if (product.sizes && product.sizes.length > 0) {
    const sizesText = product.sizes.length > 3 
      ? `размеры ${product.sizes.slice(0, 3).join(', ')} и др.`
      : `размеры ${product.sizes.join(', ')}`
    parts.push(sizesText)
  }
  
  // Добавляем цвета если есть
  if (product.colors && product.colors.length > 0) {
    const colorsText = product.colors.length > 2
      ? `в цветах ${product.colors.slice(0, 2).join(', ')} и др.`
      : `в ${product.colors.join(' и ')} цвете`
    parts.push(colorsText)
  }
  
  // Добавляем ценовую информацию
  const currentPrice = product.salePrice || product.price
  const priceText = product.salePrice 
    ? `по цене ${formatPrice(currentPrice)} (скидка ${calculateDiscountPercent(product.price, product.salePrice)}%)`
    : `за ${formatPrice(currentPrice)}`
  parts.push(priceText)
  
  // Добавляем брендинг и УТП
  const benefits = [
    'высокое качество',
    'быстрая доставка по России',
    'возврат 14 дней'
  ]
  
  if (product.salePrice) {
    benefits.unshift('скидка до 50%')
  }
  
  // Формируем финальное описание
  let description = `${parts.join(' ')} в интернет-магазине NAKEN Store. ${benefits.join(', ').replace(/^./, (str) => str.toUpperCase())}.`
  
  // Добавляем дополнительные SEO-слова если есть место
  if (description.length < 120) {
    const category = product.category || 'одежда'
    description += ` Стильная ${category.toLowerCase()}, модные тренды ${new Date().getFullYear()}.`
  }
  
  return truncateToSEOLength(description)
}

// Обрезка до SEO-длины с сохранением целостности предложений
export function truncateToSEOLength(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text
  
  // Ищем последнюю точку, запятую или пробел до лимита
  const truncated = text.slice(0, maxLength)
  const lastPunctuation = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf(','),
    truncated.lastIndexOf(' ')
  )
  
  if (lastPunctuation > maxLength * 0.8) {
    return text.slice(0, lastPunctuation + (truncated[lastPunctuation] === '.' ? 1 : 0))
  }
  
  return truncated.trim() + '...'
}

// Генерация ключевых слов для товара
export function generateProductKeywords(product: {
  name: string
  category?: string
  brand?: string
  sizes?: string[]
  colors?: string[]
  price: number
}): string {
  const keywords: string[] = []
  
  // Базовые ключевые слова
  keywords.push(product.name)
  keywords.push('NAKEN Store')
  
  // Категория
  if (product.category) {
    keywords.push(product.category.toLowerCase())
    keywords.push(`купить ${product.category.toLowerCase()}`)
    keywords.push(`${product.category.toLowerCase()} интернет магазин`)
  }
  
  // Бренд
  if (product.brand && product.brand !== 'NAKEN') {
    keywords.push(product.brand)
    keywords.push(`${product.brand} ${product.category || 'одежда'}`)
  }
  
  // Размеры (только популярные)
  if (product.sizes && product.sizes.length > 0) {
    const popularSizes = product.sizes.filter(size => 
      ['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(size.toUpperCase())
    )
    if (popularSizes.length > 0) {
      keywords.push(`размер ${popularSizes[0]}`)
    }
  }
  
  // Ценовые категории
  if (product.price < 2000) {
    keywords.push('недорогая одежда')
    keywords.push('одежда до 2000')
  } else if (product.price > 5000) {
    keywords.push('премиум одежда')
    keywords.push('дизайнерская одежда')
  }
  
  // Общие SEO-слова
  keywords.push('одежда онлайн')
  keywords.push('модная одежда')
  keywords.push('стильная одежда')
  keywords.push('одежда с доставкой')
  keywords.push('магазин одежды москва')
  
  return keywords.join(', ')
}

// Генерация структурированного описания с пунктами
export function generateStructuredDescription(product: {
  name: string
  sizes?: string[]
  colors?: string[]
  price: number
  salePrice?: number | null
  category?: string
  description?: string | null
}): string {
  const sections: string[] = []
  
  // Основное описание
  const mainDesc = generateSEODescription(product)
  sections.push(mainDesc)
  
  // Характеристики
  const features: string[] = []
  
  if (product.sizes && product.sizes.length > 0) {
    features.push(`🔹 Размеры: ${product.sizes.join(', ')}`)
  }
  
  if (product.colors && product.colors.length > 0) {
    features.push(`🔹 Цвета: ${product.colors.join(', ')}`)
  }
  
  features.push(`🔹 Материал: высококачественные ткани`)
  features.push(`🔹 Уход: машинная стирка при 30°C`)
  features.push(`🔹 Страна: дизайн NAKEN Store`)
  
  if (features.length > 0) {
    sections.push('\n**Характеристики:**\n' + features.join('\n'))
  }
  
  // Преимущества покупки
  const benefits = [
    '✅ Бесплатная доставка от 3000₽',
    '✅ Примерка при получении',
    '✅ Возврат в течение 14 дней',
    '✅ Гарантия качества',
    '✅ Быстрая доставка по России'
  ]
  
  sections.push('\n**Почему выбирают нас:**\n' + benefits.join('\n'))
  
  return sections.join('\n')
}

// Валидация SEO-описания
export function validateSEODescription(description: string): {
  isValid: boolean
  warnings: string[]
  suggestions: string[]
} {
  const warnings: string[] = []
  const suggestions: string[] = []
  
  // Проверка длины
  if (description.length < 50) {
    warnings.push('Описание слишком короткое (минимум 50 символов)')
  }
  
  if (description.length > 160) {
    warnings.push('Описание слишком длинное для meta description (максимум 160 символов)')
    suggestions.push('Сократите описание до 160 символов для лучшего отображения в поисковых результатах')
  }
  
  // Проверка ключевых слов
  const lowerDesc = description.toLowerCase()
  const hasPrice = lowerDesc.includes('₽') || lowerDesc.includes('руб') || lowerDesc.includes('цена')
  const hasBrand = lowerDesc.includes('naken')
  const hasQuality = lowerDesc.includes('качеств') || lowerDesc.includes('стильн') || lowerDesc.includes('модн')
  
  if (!hasPrice) {
    suggestions.push('Добавьте информацию о цене')
  }
  
  if (!hasBrand) {
    suggestions.push('Упомяните бренд NAKEN Store')
  }
  
  if (!hasQuality) {
    suggestions.push('Добавьте слова о качестве или стиле товара')
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  }
}

// Debounce функция
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 