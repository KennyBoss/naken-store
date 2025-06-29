import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/wishlist - Получить избранное пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ items: wishlistItems })

  } catch (error) {
    console.error('Ошибка получения избранного:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// POST /api/wishlist - Добавить товар в избранное
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'productId обязателен' },
        { status: 400 }
      )
    }

    // Проверяем существование товара
    const product = await prisma.product.findUnique({
      where: { id: productId, published: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      )
    }

    // Проверяем, нет ли уже в избранном
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { error: 'Товар уже в избранном' },
        { status: 400 }
      )
    }

    // Добавляем в избранное
    const wishlistItem = await prisma.wishlistItem.create({
      data: { userId: session.user.id, productId },
      include: {
        product: true
      }
    })

    return NextResponse.json({ 
      item: wishlistItem,
      message: 'Товар добавлен в избранное'
    })

  } catch (error) {
    console.error('Ошибка добавления в избранное:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 