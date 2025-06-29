import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию администратора
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const sizePreference = data.get('sizePreference') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
    }

    // Проверка размера файла (максимум 15MB)
    const maxSize = 15 * 1024 * 1024 // 15MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `Файл слишком большой. Максимальный размер: 15MB` 
      }, { status: 400 })
    }

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Неподдерживаемый тип файла. Разрешены: JPG, PNG, WebP' 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Создаем папку если не существует - используем тот же путь что и роут uploads
    console.log('🔍 Admin upload debug:', {
      NODE_ENV: process.env.NODE_ENV,
      UPLOADS_PATH: process.env.UPLOADS_PATH,
      cwd: process.cwd()
    })
    
    const uploadsDir = process.env.NODE_ENV === 'production' 
      ? process.env.UPLOADS_PATH || '/root/naken-store/public/uploads'  // Продакшн - используем переменную или fallback
      : join(process.cwd(), 'public', 'uploads')  // Локально - стандартный путь
    
    console.log('📁 Admin upload сохраняет в:', uploadsDir)
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Генерируем безопасное имя файла
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const sizeSuffix = sizePreference && sizePreference !== 'auto' ? `-${sizePreference}` : ''
    const fileName = `${timestamp}-${randomString}${sizeSuffix}.${fileExtension}`
    
    const filePath = join(uploadsDir, fileName)
    
    // Сохраняем файл
    await writeFile(filePath, buffer)

    // Возвращаем URL файла
    const fileUrl = `/uploads/${fileName}`
    
    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      sizePreference: sizePreference || 'auto'
    })

  } catch (error) {
    console.error('Ошибка загрузки файла:', error)
    
    return NextResponse.json({ 
      error: 'Ошибка загрузки файла' 
    }, { status: 500 })
  }
} 