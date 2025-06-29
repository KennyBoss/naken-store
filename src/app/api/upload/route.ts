import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// 🚨 ЭКСТРЕННОЕ ИСПРАВЛЕНИЕ: Убираем sharp и сложную обработку
// import { 
//   rateLimit, 
//   addSecurityHeaders, 
//   validateFile,
//   logSuspiciousActivity,
//   getClientIP 
// } from '@/lib/security'

// Простая валидация файлов без внешних зависимостей
function validateFile(file: File): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const maxSize = 15 * 1024 * 1024 // 15MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('Неподдерживаемый тип файла')
  }
  
  if (file.size > maxSize) {
    errors.push('Файл слишком большой (максимум 15MB)')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Простые заголовки безопасности
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  return response
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 ЭКСТРЕННЫЙ UPLOAD API - без sharp обработки')
    
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
      )
    }

    console.log('📁 Получен файл:', { name: file.name, type: file.type, size: file.size })

    // Простая валидация
    const fileValidation = validateFile(file)
    if (!fileValidation.isValid) {
      return addSecurityHeaders(
        NextResponse.json({ 
          error: 'Недопустимый файл',
          details: fileValidation.errors
        }, { status: 400 })
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Генерируем простое имя файла
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}-${randomString}.${fileExtension}`

    // Определяем путь для сохранения
    let uploadsRoot: string
    
    if (process.env.NODE_ENV === 'production') {
      uploadsRoot = process.env.UPLOADS_PATH || join(process.cwd(), 'public', 'uploads')
    } else {
      uploadsRoot = join(process.cwd(), 'public', 'uploads')
    }

    const uploadsDir = uploadsRoot
    const thumbnailsDir = join(uploadsDir, 'thumbnails')
    
    console.log('📂 Путь сохранения:', uploadsDir)
    
    // Создаем директории
    try {
      if (!existsSync(uploadsDir)) {
        console.log(`📁 Создаем директорию: ${uploadsDir}`)
        await mkdir(uploadsDir, { recursive: true })
      }
      if (!existsSync(thumbnailsDir)) {
        console.log(`📁 Создаем директорию: ${thumbnailsDir}`)
        await mkdir(thumbnailsDir, { recursive: true })
      }
    } catch (dirError) {
      console.error('❌ Ошибка создания директории:', dirError)
      return addSecurityHeaders(
        NextResponse.json({ 
          error: 'Ошибка сервера при создании директории для загрузки' 
        }, { status: 500 })
      )
    }

    const filePath = join(uploadsDir, fileName)
    
    // Сохраняем файл БЕЗ ОБРАБОТКИ
    try {
      console.log('💾 Сохраняем файл:', filePath)
      await writeFile(filePath, buffer)
      console.log('✅ Файл успешно сохранен')
    } catch (writeError) {
      console.error('❌ Ошибка записи файла:', writeError)
      return addSecurityHeaders(
        NextResponse.json({ 
          error: 'Ошибка сервера при сохранении файла.' 
        }, { status: 500 })
      )
    }

    // Возвращаем простой результат
    const fileUrl = `/uploads/${fileName}`
    
    console.log('🎉 Файл загружен успешно:', fileUrl)
    
    return addSecurityHeaders(
      NextResponse.json({ 
        success: true, 
        url: fileUrl,
        fileName: fileName,
        originalName: file.name,
        metadata: {
          originalSize: file.size,
          processedSize: buffer.length
        }
      })
    )

  } catch (error) {
    console.error('❌ Критическая ошибка загрузки файла:', error)
    
    return addSecurityHeaders(
      NextResponse.json({ 
        error: `Ошибка загрузки файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      }, { status: 500 })
    )
  }
} 