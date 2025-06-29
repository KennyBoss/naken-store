import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { 
  rateLimit, 
  addSecurityHeaders, 
  validateFile,
  logSuspiciousActivity,
  getClientIP 
} from '@/lib/security'
import { 
  processImageForMasonry, 
  processImageKeepRatio,
  createThumbnail, 
  getRandomMasonrySize,
  MASONRY_SIZES,
  SIZE_LIMITS,
  type MasonrySizeKey 
} from '@/lib/image-processing'

// Rate limiting для загрузки файлов: 10 файлов в минуту
const uploadRateLimit = rateLimit({
  maxRequests: 10,
  windowMs: 60 * 1000,
  keyGenerator: (req) => `upload:${getClientIP(req)}`
})

export async function POST(request: NextRequest) {
  try {
    // Проверка rate limit
    const rateLimitResult = uploadRateLimit(request)
    if (!rateLimitResult.success) {
      logSuspiciousActivity('rate_limit', {
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        path: '/api/upload'
      })
      
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Слишком много попыток загрузки файлов' },
          { status: 429 }
        )
      )
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const sizePreference = data.get('sizePreference') as string | null
    const keepRatio = data.get('keepRatio') === 'true' // Новый параметр для сохранения пропорций

    if (!file) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
      )
    }

    // Проверка размера файла
    if (file.size > SIZE_LIMITS.maxFileSize) {
      return addSecurityHeaders(
        NextResponse.json({ 
          error: `Файл слишком большой. Максимальный размер: ${SIZE_LIMITS.maxFileSize / 1024 / 1024}MB` 
        }, { status: 400 })
      )
    }

    // Валидация файла
    const fileValidation = validateFile(file)
    if (!fileValidation.isValid) {
      logSuspiciousActivity('invalid_token', {
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        path: '/api/upload',
        data: { 
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          errors: fileValidation.errors
        }
      })
      
      return addSecurityHeaders(
        NextResponse.json({ 
          error: 'Недопустимый файл',
          details: fileValidation.errors
        }, { status: 400 })
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Дополнительная проверка содержимого файла по magic bytes
    const magicBytes = buffer.slice(0, 4)
    const validMagicBytes = [
      [0xFF, 0xD8, 0xFF], // JPEG
      [0x89, 0x50, 0x4E, 0x47], // PNG
      [0x52, 0x49, 0x46, 0x46], // WebP (RIFF)
    ]
    
    const isValidFile = validMagicBytes.some(magic => 
      magic.every((byte, index) => magicBytes[index] === byte)
    )
    
    if (!isValidFile) {
      logSuspiciousActivity('invalid_token', {
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        path: '/api/upload',
        data: { 
          fileName: file.name,
          suspiciousMagicBytes: Array.from(magicBytes)
        }
      })
      
      return addSecurityHeaders(
        NextResponse.json({ 
          error: 'Недопустимый формат файла' 
        }, { status: 400 })
      )
    }

    // Выбираем метод обработки в зависимости от параметров
    let processed: any
    let fileName: string
    
    if (keepRatio) {
      // Для товаров - сохраняем пропорции
      const result = await processImageKeepRatio(buffer)
      processed = {
        processedBuffer: result.processedBuffer,
        metadata: {
          ...result.metadata,
          sizeKey: 'original' // Для совместимости
        }
      }
      
      // Генерируем имя файла с сохранением пропорций
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      fileName = `${timestamp}-${randomString}.jpg`
    } else {
      // Для masonry галереи - обрезаем под размеры
      let sizeKey: MasonrySizeKey | undefined
      
      if (sizePreference && sizePreference in MASONRY_SIZES) {
        sizeKey = sizePreference as MasonrySizeKey
      } else if (sizePreference === 'random') {
        sizeKey = getRandomMasonrySize()
      }
      
      processed = await processImageForMasonry(buffer, sizeKey)
      
      // Генерируем имя файла с размером
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      fileName = `${timestamp}-${randomString}-${processed.metadata.sizeKey}.jpg`
    }

    // Создаем миниатюру
    const thumbnailBuffer = await createThumbnail(processed.processedBuffer)

    // Определяем путь для сохранения в зависимости от окружения
    let uploadsRoot: string;
    
    if (process.env.NODE_ENV === 'production') {
      // В production проверяем есть ли standalone режим
      const standaloneUploads = join(process.cwd(), '.next', 'standalone', 'public', 'uploads');
      const regularUploads = join(process.cwd(), 'public', 'uploads');
      
      // Используем standalone если папка существует
      if (existsSync(join(process.cwd(), '.next', 'standalone', 'public'))) {
        uploadsRoot = standaloneUploads;
        console.log('🔧 Используем standalone режим для uploads:', uploadsRoot);
      } else {
        uploadsRoot = process.env.UPLOADS_PATH || regularUploads;
      }
    } else {
      uploadsRoot = join(process.cwd(), 'public', 'uploads');
    }

    const uploadsDir = uploadsRoot;
    const thumbnailsDir = join(uploadsDir, 'thumbnails');
    
    // Убедимся, что директории существуют
    try {
      if (!existsSync(uploadsDir)) {
        console.log(`Creating directory: ${uploadsDir}`);
        await mkdir(uploadsDir, { recursive: true });
      }
      if (!existsSync(thumbnailsDir)) {
        console.log(`Creating directory: ${thumbnailsDir}`);
        await mkdir(thumbnailsDir, { recursive: true });
      }
    } catch (dirError) {
      console.error('Ошибка создания директории:', dirError);
      return addSecurityHeaders(
        NextResponse.json({ 
          error: 'Ошибка сервера при создании директории для загрузки' 
        }, { status: 500 })
      );
    }

    // Генерируем имя для миниатюры
    const thumbnailName = fileName.replace('.jpg', '-thumb.jpg')
    
    const filePath = join(uploadsDir, fileName)
    const thumbnailPath = join(thumbnailsDir, thumbnailName)
    
    // Сохраняем файлы
    try {
      await writeFile(filePath, processed.processedBuffer)
      await writeFile(thumbnailPath, thumbnailBuffer)
    } catch (writeError) {
      console.error('Ошибка записи файла:', writeError);
      // Попытка определить причину ошибки
      if (writeError instanceof Error && 'code' in writeError && writeError.code === 'EACCES') {
        console.error('ОШИБКА EACCES: Отказано в доступе. Проверьте права на запись в директорию uploads.');
        return addSecurityHeaders(
          NextResponse.json({ 
            error: 'Ошибка сервера: нет прав на запись файла.' 
          }, { status: 500 })
        );
      }
      return addSecurityHeaders(
        NextResponse.json({ 
          error: 'Ошибка сервера при сохранении файла.' 
        }, { status: 500 })
      );
    }

    // Возвращаем информацию о файле
    const fileUrl = `/uploads/${fileName}`
    const thumbnailUrl = `/uploads/thumbnails/${thumbnailName}`
    
    return addSecurityHeaders(
      NextResponse.json({ 
        success: true, 
        url: fileUrl,
        thumbnailUrl: thumbnailUrl,
        fileName: fileName,
        originalName: file.name,
        metadata: {
          ...processed.metadata,
          originalSize: file.size,
          processedSize: processed.processedBuffer.length,
          compressionRatio: Math.round((1 - processed.processedBuffer.length / file.size) * 100)
        },
        availableSizes: Object.keys(MASONRY_SIZES).map(key => ({
          key,
          ...MASONRY_SIZES[key as MasonrySizeKey],
          isSelected: key === processed.metadata.sizeKey
        }))
      })
    )

  } catch (error) {
    console.error('Ошибка загрузки файла:', error)
    
    logSuspiciousActivity('failed_login', {
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
      path: '/api/upload',
      data: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    
    return addSecurityHeaders(
      NextResponse.json({ 
        error: `Ошибка загрузки файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      }, { status: 500 })
    )
  }
} 