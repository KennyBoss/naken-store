import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createProductSlug } from '@/lib/utils'
import { 
  rateLimit, 
  addSecurityHeaders, 
  sanitizeInput,
  detectSQLInjection,
  logSuspiciousActivity,
  getClientIP 
} from '@/lib/security'

// Rate limiting для админских операций: 30 запросов в минуту
const adminRateLimit = rateLimit({
  maxRequests: 30,
  windowMs: 60 * 1000,
  keyGenerator: (req) => `admin:${getClientIP(req)}`
})

export async function GET(request: NextRequest) {
  try {
    // Проверка rate limit
    const rateLimitResult = adminRateLimit(request)
    if (!rateLimitResult.success) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Слишком много запросов' },
          { status: 429 }
        )
      )
    }

    // Проверка админских прав
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      logSuspiciousActivity('unauthorized_access', {
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        path: '/api/admin/products',
        userId: session?.user?.id
      })
      
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Доступ запрещен' },
          { status: 403 }
        )
      )
    }

    const products = await prisma.product.findMany({
      include: {
        sizes: {
          include: {
            size: true
          }
        },
        color: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return addSecurityHeaders(
      NextResponse.json({ products })
    )
  } catch (error) {
    console.error('Ошибка получения товаров:', error)
    return addSecurityHeaders(
      NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      )
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Проверка rate limit
    const rateLimitResult = adminRateLimit(request)
    if (!rateLimitResult.success) {
      logSuspiciousActivity('rate_limit', {
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        path: '/api/admin/products'
      })
      
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Слишком много запросов' },
          { status: 429 }
        )
      )
    }

    // Проверка админских прав
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      logSuspiciousActivity('unauthorized_access', {
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        path: '/api/admin/products',
        userId: session?.user?.id
      })
      
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Доступ запрещен' },
          { status: 403 }
        )
      )
    }

    const data = await request.json()
    
    console.log('Данные для создания товара:', data)
    
    // Валидация и санитизация входных данных
    if (!data.name || !data.sku || data.price === undefined || !data.sizeIds || data.sizeIds.length === 0 || !data.colorId) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Не заполнены обязательные поля (название, SKU, цена, размеры, цвет)' },
          { status: 400 }
        )
      )
    }

    // Проверка на SQL инъекции
    const fieldsToCheck = [data.name, data.description, data.sku]
    for (const field of fieldsToCheck) {
      if (field && detectSQLInjection(field)) {
        logSuspiciousActivity('invalid_token', {
          ip: getClientIP(request),
          userAgent: request.headers.get('user-agent') || undefined,
          path: '/api/admin/products',
          userId: session.user.id,
          data: { suspiciousField: field }
        })
        
        return addSecurityHeaders(
          NextResponse.json(
            { error: 'Обнаружены недопустимые символы в данных' },
            { status: 400 }
          )
        )
      }
    }

    // Санитизация данных
    const sanitizedData = {
      ...data,
      name: sanitizeInput(data.name),
      description: data.description ? sanitizeInput(data.description) : null,
      sku: sanitizeInput(data.sku)
    }
    
    // Проверяем уникальность SKU
    const existingSku = await prisma.product.findFirst({
      where: { sku: sanitizedData.sku }
    })
    
    if (existingSku) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Товар с таким артикулом уже существует' },
          { status: 400 }
        )
      )
    }

    // Получаем названия размеров и цветов для slug'а
    const selectedSizes = await prisma.size.findMany({
      where: { id: { in: sanitizedData.sizeIds } },
      select: { name: true }
    })
    
    const selectedColor = await prisma.color.findUnique({
      where: { id: sanitizedData.colorId },
      select: { name: true }
    })
    
    // Генерируем SEO-friendly slug с размерами и цветами
    console.log('Генерируем slug для:', { 
      name: sanitizedData.name, 
      sizes: selectedSizes.map(s => s.name), 
      color: selectedColor?.name 
    })
    
    const baseSlug = createProductSlug(sanitizedData.name, {
      sizes: selectedSizes.map(s => s.name),
      colors: selectedColor ? [selectedColor.name] : [],
      category: 'одежда',
      brand: 'NAKEN',
      sku: sanitizedData.sku
    })
    console.log('Сгенерированный базовый slug:', baseSlug)
    
    // Проверяем уникальность slug'а
    let uniqueSlug = baseSlug
    let counter = 1
    
    while (true) {
      const existingSlug = await prisma.product.findUnique({
        where: { slug: uniqueSlug }
      })
      
      if (!existingSlug) {
        break
      }
      
      uniqueSlug = `${baseSlug}-${counter}`
      counter++
    }
    
    console.log('Финальный уникальный slug:', uniqueSlug)
    
    // Создаем товар с множественными размерами
    const product = await prisma.product.create({
      data: {
        name: sanitizedData.name,
        slug: uniqueSlug,
        description: sanitizedData.description,
        price: parseFloat(sanitizedData.price),
        salePrice: sanitizedData.salePrice ? parseFloat(sanitizedData.salePrice) : null,
        sku: sanitizedData.sku,
        stock: parseInt(sanitizedData.stock) || 0,
        images: JSON.stringify(sanitizedData.images || []),
        colorId: sanitizedData.colorId,
        published: sanitizedData.published || false,
        // Создаем связи с размерами
        sizes: {
          create: sanitizedData.sizeIds.map((sizeId: string) => ({
            sizeId: sizeId,
            stock: parseInt(sanitizedData.stock) || 0 // Можно будет позже настроить stock для каждого размера
          }))
        }
      },
      include: {
        sizes: {
          include: {
            size: true
          }
        },
        color: true
      }
    })

    console.log('Товар успешно создан:', product.id)

    return addSecurityHeaders(
      NextResponse.json({ 
        success: true, 
        product,
        message: 'Товар успешно создан' 
      })
    )

  } catch (error) {
    console.error('Ошибка создания товара:', error)
    return addSecurityHeaders(
      NextResponse.json(
        { error: 'Ошибка создания товара' },
        { status: 500 }
      )
    )
  }
} 