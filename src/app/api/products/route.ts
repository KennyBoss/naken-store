import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'created'
    const shuffle = searchParams.get('shuffle') === 'true'

    const skip = (page - 1) * limit

    // Создаем фильтры
    const where: any = {
      published: true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Категории больше не используются

    let products: any[] = []
    let total = 0

    if (shuffle) {
      // Упрощенный подход: получаем все товары и перемешиваем в памяти
      const allProducts = await prisma.product.findMany({
        where,
        include: {
          reviews: true,
          sizes: { include: { size: true } },
          color: true,
        },
      })
      
      // Перемешиваем массив
      for (let i = allProducts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allProducts[i], allProducts[j]] = [allProducts[j], allProducts[i]];
      }
      
      // Применяем пагинацию после перемешивания
      products = allProducts.slice(skip, skip + limit)
      total = allProducts.length
    } else {
      // Сортировка
      let orderBy: any = { createdAt: 'desc' }
      switch (sort) {
        case 'price-asc':
          orderBy = { price: 'asc' }
          break
        case 'price-desc':
          orderBy = { price: 'desc' }
          break
        case 'name':
          orderBy = { name: 'asc' }
          break
      }
      
      const [fetchedProducts, count] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            reviews: true,
            sizes: { include: { size: true } },
            color: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.product.count({ where }),
      ])
      products = fetchedProducts
      total = count
    }

    // Добавляем расчет рейтингов
    const productsWithRatings = products.map(product => {
      const reviews = product.reviews || []
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
          : 0
      const reviewCount = reviews.length

      return {
        ...product,
        averageRating: Number(averageRating.toFixed(1)),
        reviewCount,
        reviews: undefined, // Убираем reviews из ответа
      }
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: productsWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })

  } catch (error) {
    console.error('Ошибка получения товаров:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 