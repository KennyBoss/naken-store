// Утилиты для Generative Engine Optimization (GEO)

export interface ProductGEOData {
  name: string
  description?: string
  category?: string
  color?: string
  style?: string
  season?: string
  occasion?: string
  material?: string
}

/**
 * Генерирует семантическое название файла для изображения товара
 * Пример: "elegant-black-dress-office-evening.jpg"
 */
export function generateSemanticImageName(product: ProductGEOData, index: number = 0): string {
  const parts: string[] = []
  
  // Стиль
  if (product.style) {
    parts.push(transliterateToSlug(product.style))
  }
  
  // Цвет  
  if (product.color) {
    parts.push(transliterateToSlug(product.color))
  }
  
  // Основной тип товара из названия
  const productType = extractProductType(product.name)
  if (productType) {
    parts.push(transliterateToSlug(productType))
  }
  
  // Повод
  if (product.occasion && product.occasion !== 'Универсальный') {
    parts.push(transliterateToSlug(product.occasion))
  }
  
  // Сезон
  if (product.season && product.season !== 'Всесезонный') {
    parts.push(transliterateToSlug(product.season))
  }
  
  // Добавляем индекс если больше одного изображения
  if (index > 0) {
    parts.push(`view${index + 1}`)
  }
  
  return parts.filter(Boolean).join('-') + '.jpg'
}

/**
 * Генерирует оптимизированный alt-тег для изображения
 */
export function generateImageAlt(product: ProductGEOData, index: number = 0): string {
  const parts: string[] = []
  
  if (product.style && product.style !== 'Универсальный') {
    parts.push(product.style)
  }
  
  if (product.color) {
    parts.push(product.color.toLowerCase())
  }
  
  const productType = extractProductType(product.name)
  if (productType) {
    parts.push(productType.toLowerCase())
  }
  
  if (product.occasion && product.occasion !== 'Универсальный') {
    parts.push(`для ${product.occasion.toLowerCase()}`)
  }
  
  if (index > 0) {
    const viewNames = ['общий вид', 'детали', 'вид сзади', 'крупный план']
    parts.push(`- ${viewNames[index] || `вид ${index + 1}`}`)
  }
  
  return parts.join(' ') + ' | NAKEN Store'
}

/**
 * Создает SEO-оптимизированное описание товара для ИИ
 */
export function generateGEODescription(product: ProductGEOData): string {
  const parts: string[] = []
  
  // Основное описание
  parts.push(product.description || product.name)
  
  // Характеристики для ИИ
  const characteristics: string[] = []
  
  if (product.style && product.style !== 'Универсальный') {
    characteristics.push(`стиль: ${product.style.toLowerCase()}`)
  }
  
  if (product.material && product.material !== 'Смешанный состав') {
    characteristics.push(`материал: ${product.material.toLowerCase()}`)
  }
  
  if (product.season && product.season !== 'Всесезонный') {
    characteristics.push(`сезон: ${product.season.toLowerCase()}`)
  }
  
  if (product.occasion && product.occasion !== 'Универсальный') {
    characteristics.push(`для: ${product.occasion.toLowerCase()}`)
  }
  
  if (characteristics.length > 0) {
    parts.push(`Характеристики: ${characteristics.join(', ')}.`)
  }
  
  // Призыв к действию
  parts.push('Качественная одежда с быстрой доставкой по России.')
  
  return parts.join(' ')
}

/**
 * Извлекает тип товара из названия
 */
function extractProductType(name: string): string | null {
  const lowerName = name.toLowerCase()
  
  const types = [
    { keywords: ['платье', 'dress'], type: 'платье' },
    { keywords: ['блузка', 'блуза', 'рубашка', 'shirt', 'blouse'], type: 'блузка' },
    { keywords: ['брюки', 'pants', 'штаны'], type: 'брюки' },
    { keywords: ['джинсы', 'jeans'], type: 'джинсы' },
    { keywords: ['юбка', 'skirt'], type: 'юбка' },
    { keywords: ['жакет', 'пиджак', 'blazer'], type: 'жакет' },
    { keywords: ['свитер', 'sweater', 'джемпер'], type: 'свитер' },
    { keywords: ['кардиган', 'cardigan'], type: 'кардиган' },
    { keywords: ['куртка', 'jacket'], type: 'куртка' },
    { keywords: ['пальто', 'coat'], type: 'пальто' },
    { keywords: ['футболка', 't-shirt', 'tshirt'], type: 'футболка' },
    { keywords: ['топ', 'top'], type: 'топ' }
  ]
  
  for (const typeInfo of types) {
    if (typeInfo.keywords.some(keyword => lowerName.includes(keyword))) {
      return typeInfo.type
    }
  }
  
  return null
}

/**
 * Транслитерация и создание slug для URL
 */
function transliterateToSlug(text: string): string {
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  }
  
  return text
    .toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Генерирует список ключевых слов для ИИ на основе товара
 */
export function generateGEOKeywords(product: ProductGEOData): string[] {
  const keywords: string[] = []
  
  // Базовые ключевые слова
  const productType = extractProductType(product.name)
  if (productType) {
    keywords.push(productType)
    keywords.push(`${productType} купить`)
    keywords.push(`${productType} интернет магазин`)
  }
  
  // Стиль + тип
  if (product.style && product.style !== 'Универсальный' && productType) {
    keywords.push(`${product.style.toLowerCase()} ${productType}`)
  }
  
  // Цвет + тип  
  if (product.color && productType) {
    keywords.push(`${product.color.toLowerCase()} ${productType}`)
  }
  
  // Повод + тип
  if (product.occasion && product.occasion !== 'Универсальный' && productType) {
    const occasionMap: { [key: string]: string[] } = {
      'Офис': ['офисный', 'деловой', 'для работы'],
      'Свидание': ['для свидания', 'романтический'],
      'Вечерний выход': ['вечерний', 'для праздника'],
      'Повседневная носка': ['повседневный', 'casual'],
      'Путешествия': ['для путешествий', 'удобный'],
      'Спорт': ['спортивный', 'для фитнеса']
    }
    
    const variations = occasionMap[product.occasion] || [product.occasion.toLowerCase()]
    variations.forEach(variation => {
      keywords.push(`${variation} ${productType}`)
    })
  }
  
  // Сезонные ключевые слова
  if (product.season && product.season !== 'Всесезонный' && productType) {
    keywords.push(`${productType} ${product.season.toLowerCase()}`)
  }
  
  return keywords.filter((keyword, index, arr) => arr.indexOf(keyword) === index)
}

/**
 * Проверяет оптимизацию контента для ИИ
 */
export function validateGEOContent(content: string): {
  score: number
  suggestions: string[]
} {
  const suggestions: string[] = []
  let score = 100
  
  // Проверяем длину
  if (content.length < 100) {
    score -= 20
    suggestions.push('Контент слишком короткий. Добавьте больше деталей.')
  }
  
  if (content.length > 2000) {
    score -= 10
    suggestions.push('Контент слишком длинный. ИИ лучше обрабатывает краткие описания.')
  }
  
  // Проверяем структуру
  if (!content.includes('.')) {
    score -= 15
    suggestions.push('Добавьте структуру с предложениями.')
  }
  
  // Проверяем ключевые слова моды
  const fashionKeywords = ['стиль', 'модный', 'цвет', 'размер', 'материал', 'качество']
  const hasKeywords = fashionKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  )
  
  if (!hasKeywords) {
    score -= 25
    suggestions.push('Добавьте ключевые слова моды: стиль, цвет, материал, качество.')
  }
  
  return {
    score: Math.max(0, score),
    suggestions
  }
} 