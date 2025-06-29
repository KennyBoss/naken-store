import sharp from 'sharp'

// Предустановленные варианты размеров для Masonry сетки
export const MASONRY_SIZES = {
  square_small: { width: 300, height: 300, ratio: '1:1' },
  square_medium: { width: 400, height: 400, ratio: '1:1' },
  square_large: { width: 500, height: 500, ratio: '1:1' },
  
  portrait_small: { width: 300, height: 400, ratio: '3:4' },
  portrait_medium: { width: 350, height: 500, ratio: '7:10' },
  portrait_large: { width: 400, height: 600, ratio: '2:3' },
  
  landscape_small: { width: 400, height: 300, ratio: '4:3' },
  landscape_medium: { width: 500, height: 350, ratio: '10:7' },
  landscape_large: { width: 600, height: 400, ratio: '3:2' },
  
  tall_portrait: { width: 300, height: 500, ratio: '3:5' },
  tall_portrait_large: { width: 350, height: 600, ratio: '7:12' },
  
  wide_landscape: { width: 600, height: 300, ratio: '2:1' },
  wide_landscape_large: { width: 700, height: 350, ratio: '2:1' }
}

export const SIZE_LIMITS = {
  minWidth: 300,
  maxWidth: 800,
  minHeight: 300,
  maxHeight: 1200,
  maxFileSize: 15 * 1024 * 1024, // 15MB
  supportedFormats: ['jpeg', 'jpg', 'png', 'webp']
}

export type MasonrySizeKey = keyof typeof MASONRY_SIZES

// Функция для определения лучшего размера на основе исходного изображения
export function getBestMasonrySize(originalWidth: number, originalHeight: number): MasonrySizeKey {
  const aspectRatio = originalWidth / originalHeight
  
  // Определяем категорию по соотношению сторон
  if (aspectRatio >= 0.9 && aspectRatio <= 1.1) {
    // Квадратные изображения
    if (Math.min(originalWidth, originalHeight) >= 500) return 'square_large'
    if (Math.min(originalWidth, originalHeight) >= 400) return 'square_medium'
    return 'square_small'
  }
  
  if (aspectRatio < 0.9) {
    // Портретные изображения
    if (aspectRatio <= 0.6) {
      return originalHeight >= 600 ? 'tall_portrait_large' : 'tall_portrait'
    }
    if (aspectRatio <= 0.7) {
      return originalHeight >= 600 ? 'portrait_large' : 'portrait_medium'
    }
    return 'portrait_small'
  }
  
  // Альбомные изображения
  if (aspectRatio >= 1.8) {
    return originalWidth >= 700 ? 'wide_landscape_large' : 'wide_landscape'
  }
  if (aspectRatio >= 1.4) {
    return originalWidth >= 600 ? 'landscape_large' : 'landscape_medium'
  }
  return 'landscape_small'
}

// Функция для обработки изображения
export async function processImageForMasonry(
  buffer: Buffer,
  sizeKey?: MasonrySizeKey
): Promise<{
  processedBuffer: Buffer
  metadata: {
    width: number
    height: number
    format: string
    size: number
    sizeKey: MasonrySizeKey
    ratio: string
  }
}> {
  try {
    // Получаем метаданные исходного изображения
    const image = sharp(buffer)
    const metadata = await image.metadata()
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Не удалось получить размеры изображения')
    }

    // Проверяем ограничения исходного изображения - УБИРАЕМ ЭТУ ПРОВЕРКУ
    // if (metadata.width < SIZE_LIMITS.minWidth || 
    //     metadata.height < SIZE_LIMITS.minHeight ||
    //     metadata.width > SIZE_LIMITS.maxWidth * 2 || 
    //     metadata.height > SIZE_LIMITS.maxHeight * 2) {
    //   throw new Error(`Изображение должно быть от ${SIZE_LIMITS.minWidth}x${SIZE_LIMITS.minHeight} до ${SIZE_LIMITS.maxWidth * 2}x${SIZE_LIMITS.maxHeight * 2}`)
    // }

    // Определяем размер для обработки
    const targetSizeKey = sizeKey || getBestMasonrySize(metadata.width, metadata.height)
    const targetSize = MASONRY_SIZES[targetSizeKey]

    // Обрабатываем изображение
    const processedBuffer = await image
      .resize(targetSize.width, targetSize.height, {
        fit: 'cover', // Обрезаем, сохраняя пропорции
        position: 'center'
      })
      .jpeg({ 
        quality: 95,  // Высокое качество для основных изображений
        progressive: true 
      })
      .toBuffer()

    // Проверяем размер файла
    if (processedBuffer.length > SIZE_LIMITS.maxFileSize) {
      // Если слишком большой, сжимаем сильнее
      const compressedBuffer = await sharp(buffer)
        .resize(targetSize.width, targetSize.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ 
          quality: 90,  // Даже при сжатии сохраняем хорошее качество
          progressive: true 
        })
        .toBuffer()
      
      return {
        processedBuffer: compressedBuffer,
        metadata: {
          width: targetSize.width,
          height: targetSize.height,
          format: 'jpeg',
          size: compressedBuffer.length,
          sizeKey: targetSizeKey,
          ratio: targetSize.ratio
        }
      }
    }

    return {
      processedBuffer,
      metadata: {
        width: targetSize.width,
        height: targetSize.height,
        format: 'jpeg',
        size: processedBuffer.length,
        sizeKey: targetSizeKey,
        ratio: targetSize.ratio
      }
    }

  } catch (error) {
    console.error('Ошибка обработки изображения:', error)
    throw new Error(`Ошибка обработки изображения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
  }
}

// Функция для создания миниатюры
export async function createThumbnail(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize(150, 150, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 80 })
    .toBuffer()
}

// Функция для получения случайного размера (для разнообразия)
export function getRandomMasonrySize(): MasonrySizeKey {
  const sizeKeys = Object.keys(MASONRY_SIZES) as MasonrySizeKey[]
  const weights = {
    // Квадратные - средний вес
    square_small: 2,
    square_medium: 3,
    square_large: 2,
    
    // Портретные - высокий вес (красиво в Masonry)
    portrait_small: 3,
    portrait_medium: 4,
    portrait_large: 3,
    
    // Альбомные - средний вес
    landscape_small: 2,
    landscape_medium: 2,
    landscape_large: 1,
    
    // Высокие портретные - высокий вес (эффектно)
    tall_portrait: 3,
    tall_portrait_large: 2,
    
    // Широкие альбомные - низкий вес
    wide_landscape: 1,
    wide_landscape_large: 1
  }
  
  const weightedKeys: MasonrySizeKey[] = []
  sizeKeys.forEach(key => {
    const weight = weights[key] || 1
    for (let i = 0; i < weight; i++) {
      weightedKeys.push(key)
    }
  })
  
  return weightedKeys[Math.floor(Math.random() * weightedKeys.length)]
}

// Новая функция для обработки изображений с сохранением пропорций
export async function processImageKeepRatio(
  buffer: Buffer,
  maxWidth: number = 1200,
  maxHeight: number = 1200
): Promise<{
  processedBuffer: Buffer
  metadata: {
    width: number
    height: number
    format: string
    size: number
    aspectRatio: number
  }
}> {
  try {
    const image = sharp(buffer)
    const metadata = await image.metadata()
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Не удалось получить размеры изображения')
    }

    // Рассчитываем новые размеры, сохраняя пропорции
    let newWidth = metadata.width
    let newHeight = metadata.height
    
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      const widthRatio = maxWidth / metadata.width
      const heightRatio = maxHeight / metadata.height
      const ratio = Math.min(widthRatio, heightRatio)
      
      newWidth = Math.round(metadata.width * ratio)
      newHeight = Math.round(metadata.height * ratio)
    }

    // Обрабатываем изображение с высоким качеством
    const processedBuffer = await image
      .resize(newWidth, newHeight, {
        fit: 'inside',  // Сохраняем пропорции
        withoutEnlargement: true  // Не увеличиваем маленькие изображения
      })
      .jpeg({ 
        quality: 95,  // Высокое качество
        progressive: true
      })
      .toBuffer()

    return {
      processedBuffer,
      metadata: {
        width: newWidth,
        height: newHeight,
        format: 'jpeg',
        size: processedBuffer.length,
        aspectRatio: newWidth / newHeight
      }
    }
  } catch (error) {
    console.error('Ошибка обработки изображения:', error)
    throw new Error(`Ошибка обработки изображения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
  }
} 