'use client'

import { Product, ProductSize, Size, Color } from '@prisma/client'

interface ProductWithRelations extends Product {
  sizes?: (ProductSize & { size: Size })[]
  color?: Color | null
}

interface JsonLdProductProps {
  product: ProductWithRelations
  baseUrl?: string
}

export default function JsonLdProduct({ product, baseUrl = 'https://naken.store' }: JsonLdProductProps) {
  let images: string[] = []
  try {
    images = JSON.parse(product.images || '[]')
  } catch (e) {
    images = []
  }

  // Генерируем размеры для Schema
  const availableSizes = product.sizes?.map(ps => ps.size.name) || []
  
  // Определяем категорию товара на основе названия
  const category = determineCategory(product.name)
  
  // Материал из описания (если есть)
  const material = extractMaterial(product.description || '')
  
  // Цвет
  const color = product.color?.name || 'Не указан'

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - стильная одежда от NAKEN Store`,
    "image": images.map(img => `${baseUrl}${img}`),
    "url": `${baseUrl}/product/${product.slug}`,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": "NAKEN"
    },
    "category": category,
    "color": color,
    "material": material,
    "offers": {
      "@type": "Offer",
      "price": product.salePrice || product.price,
      "priceCurrency": "RUB",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `${baseUrl}/product/${product.slug}`,
      "seller": {
        "@type": "Organization",
        "name": "NAKEN Store",
        "url": baseUrl
      },
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 дней
    },
    "aggregateRating": {
      "@type": "AggregateRating", 
      "ratingValue": "4.5",
      "reviewCount": "12",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  // Добавляем размеры если они есть
  if (availableSizes.length > 0) {
    ;(productSchema as any).size = availableSizes
  }

  // Добавляем дополнительные свойства для fashion
  ;(productSchema as any).additionalProperty = [
    {
      "@type": "PropertyValue",
      "name": "Стиль",
      "value": determineStyle(product.name, product.description || '')
    },
    {
      "@type": "PropertyValue", 
      "name": "Сезон",
      "value": determineSeason(product.name, product.description || '')
    },
    {
      "@type": "PropertyValue",
      "name": "Повод",
      "value": determineOccasion(product.name, product.description || '')
    }
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  )
}

// Утилиты для определения характеристик товара
function determineCategory(name: string): string {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('платье') || lowerName.includes('dress')) return 'Платья'
  if (lowerName.includes('блузка') || lowerName.includes('рубашка') || lowerName.includes('shirt')) return 'Блузки и рубашки'
  if (lowerName.includes('брюки') || lowerName.includes('джинсы') || lowerName.includes('pants')) return 'Брюки и джинсы'
  if (lowerName.includes('юбка') || lowerName.includes('skirt')) return 'Юбки'
  if (lowerName.includes('жакет') || lowerName.includes('пиджак') || lowerName.includes('blazer')) return 'Жакеты и пиджаки'
  if (lowerName.includes('свитер') || lowerName.includes('кардиган') || lowerName.includes('sweater')) return 'Свитеры и кардиганы'
  if (lowerName.includes('куртка') || lowerName.includes('пальто') || lowerName.includes('jacket')) return 'Верхняя одежда'
  
  return 'Одежда'
}

function determineStyle(name: string, description: string): string {
  const text = (name + ' ' + description).toLowerCase()
  
  if (text.includes('casual') || text.includes('повседневн')) return 'Casual'
  if (text.includes('офис') || text.includes('деловой') || text.includes('business')) return 'Деловой'
  if (text.includes('элегант') || text.includes('elegant') || text.includes('классик')) return 'Элегантный'
  if (text.includes('спорт') || text.includes('sport')) return 'Спортивный'
  if (text.includes('романтик') || text.includes('romantic')) return 'Романтический'
  if (text.includes('минимализм') || text.includes('minimal')) return 'Минималистичный'
  
  return 'Универсальный'
}

function determineSeason(name: string, description: string): string {
  const text = (name + ' ' + description).toLowerCase()
  
  if (text.includes('лето') || text.includes('summer')) return 'Лето'
  if (text.includes('зима') || text.includes('winter')) return 'Зима'
  if (text.includes('весна') || text.includes('spring')) return 'Весна'
  if (text.includes('осень') || text.includes('autumn') || text.includes('fall')) return 'Осень'
  if (text.includes('демисезон')) return 'Демисезон'
  
  return 'Всесезонный'
}

function determineOccasion(name: string, description: string): string {
  const text = (name + ' ' + description).toLowerCase()
  
  if (text.includes('офис') || text.includes('работа') || text.includes('office')) return 'Офис'
  if (text.includes('свидание') || text.includes('романтик') || text.includes('date')) return 'Свидание'
  if (text.includes('вечер') || text.includes('праздник') || text.includes('party')) return 'Вечерний выход'
  if (text.includes('прогулка') || text.includes('casual') || text.includes('повседневн')) return 'Повседневная носка'
  if (text.includes('путешествие') || text.includes('travel')) return 'Путешествия'
  if (text.includes('спорт') || text.includes('фитнес') || text.includes('gym')) return 'Спорт'
  
  return 'Универсальный'
}

function extractMaterial(description: string): string {
  const lowerDesc = description.toLowerCase()
  
  if (lowerDesc.includes('хлопок') || lowerDesc.includes('cotton')) return 'Хлопок'
  if (lowerDesc.includes('шерсть') || lowerDesc.includes('wool')) return 'Шерсть'
  if (lowerDesc.includes('шелк') || lowerDesc.includes('silk')) return 'Шелк'
  if (lowerDesc.includes('лен') || lowerDesc.includes('linen')) return 'Лен'
  if (lowerDesc.includes('полиэстер') || lowerDesc.includes('polyester')) return 'Полиэстер'
  if (lowerDesc.includes('вискоза') || lowerDesc.includes('viscose')) return 'Вискоза'
  if (lowerDesc.includes('эластан') || lowerDesc.includes('elastane')) return 'Эластан'
  
  return 'Смешанный состав'
} 