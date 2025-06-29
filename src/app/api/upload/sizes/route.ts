import { NextRequest, NextResponse } from 'next/server'
import { MASONRY_SIZES, SIZE_LIMITS } from '@/lib/image-processing'
import { addSecurityHeaders } from '@/lib/security'

// GET /api/upload/sizes - Получить доступные размеры для загрузки
export async function GET(request: NextRequest) {
  try {
    const sizes = Object.entries(MASONRY_SIZES).map(([key, size]) => ({
      key,
      ...size,
      category: getCategoryFromKey(key),
      description: getDescriptionFromKey(key)
    }))

    // Группируем размеры по категориям
    const categorizedSizes = {
      square: sizes.filter(s => s.category === 'square'),
      portrait: sizes.filter(s => s.category === 'portrait'),
      landscape: sizes.filter(s => s.category === 'landscape'),
      special: sizes.filter(s => s.category === 'special')
    }

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        limits: SIZE_LIMITS,
        sizes: categorizedSizes,
        allSizes: sizes,
        recommendations: {
          forMasonry: 'Для красивой Masonry сетки рекомендуем портретные и квадратные размеры',
          forProductCatalog: 'Для каталога товаров лучше использовать квадратные размеры',
          forGallery: 'Для галереи подойдут все размеры с акцентом на tall_portrait'
        }
      })
    )

  } catch (error) {
    console.error('Ошибка получения размеров:', error)
    return addSecurityHeaders(
      NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      )
    )
  }
}

function getCategoryFromKey(key: string): string {
  if (key.includes('square')) return 'square'
  if (key.includes('portrait') || key.includes('tall')) return 'portrait'
  if (key.includes('landscape') || key.includes('wide')) return 'landscape'
  return 'special'
}

function getDescriptionFromKey(key: string): string {
  const descriptions: Record<string, string> = {
    square_small: 'Маленький квадрат - идеален для иконок',
    square_medium: 'Средний квадрат - универсальный размер',
    square_large: 'Большой квадрат - для акцентов',
    
    portrait_small: 'Маленький портрет - компактный',
    portrait_medium: 'Средний портрет - сбалансированный',
    portrait_large: 'Большой портрет - выразительный',
    
    landscape_small: 'Маленький альбом - горизонтальный',
    landscape_medium: 'Средний альбом - панорамный',
    landscape_large: 'Большой альбом - широкий вид',
    
    tall_portrait: 'Высокий портрет - эффектный',
    tall_portrait_large: 'Очень высокий - доминирующий',
    
    wide_landscape: 'Широкий альбом - панорама',
    wide_landscape_large: 'Очень широкий - баннерный'
  }
  
  return descriptions[key] || 'Специальный размер'
} 