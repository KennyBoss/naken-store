import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/reviews - Получить отзывы для товара
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'productId обязателен' },
        { status: 400 }
      )
    }

    // Получаем отзывы с пользователями
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Подсчитываем статистику
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews 
      : 0

    // Распределение по рейтингам (1-5 звезд)
    const ratingDistribution = [0, 0, 0, 0, 0]
    reviews.forEach((review: any) => {
      ratingDistribution[review.rating - 1]++
    })

    const stats = {
      totalReviews,
      averageRating,
      ratingDistribution
    }

    return NextResponse.json({ reviews, stats })

  } catch (error) {
    console.error('Ошибка получения отзывов:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Создать новый отзыв
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, rating, comment } = body

    // Валидация
    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Некорректные данные' },
        { status: 400 }
      )
    }

    // Проверяем существование товара
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      )
    }

    // Проверяем, нет ли уже отзыва от этого пользователя
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id!,
          productId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Вы уже оставили отзыв на этот товар' },
        { status: 400 }
      )
    }

    // Создаем отзыв
    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment || null,
        userId: session.user.id!,
        productId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ review })

  } catch (error) {
    console.error('Ошибка создания отзыва:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 