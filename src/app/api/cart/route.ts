import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/cart - Получить корзину пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      // Для неавторизованных пользователей возвращаем пустую корзину
      // Корзина будет храниться в localStorage на клиенте
      return NextResponse.json({ 
        items: [], 
        total: 0,
        itemCount: 0 
      })
    }

    // Получаем корзину авторизованного пользователя из БД
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            sizes: {
              include: {
                size: true
              }
            },
            color: true
          }
        }
      }
    })

         const total = cartItems.reduce((sum: number, item: any) => {
       const price = item.product.salePrice || item.product.price
       return sum + (price * item.quantity)
     }, 0)

     const itemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)

    return NextResponse.json({
      items: cartItems,
      total,
      itemCount
    })

  } catch (error) {
    console.error('Ошибка получения корзины:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// POST /api/cart - Добавить товар в корзину
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session data:', session)

    const { productId, quantity, sizeId } = await request.json()
    console.log('Request data:', { productId, quantity, sizeId })

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Неверные данные' },
        { status: 400 }
      )
    }

    // Проверяем существование товара с размерами и цветами
    const product = await prisma.product.findUnique({
      where: { id: productId, published: true },
      include: {
        sizes: {
          include: {
            size: true
          }
        },
        color: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      )
    }

    // Если пользователь не авторизован, возвращаем данные товара для localStorage
    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        product,
        quantity,
        sizeId,
        message: 'Товар добавлен в корзину'
      })
    }

    // Для авторизованных пользователей сохраняем в БД
    // Сначала проверяем, существует ли пользователь в БД
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    if (!userExists) {
      console.error('User not found in DB:', session.user.id)
      // Обрабатываем как неавторизованного
      return NextResponse.json({
        success: true,
        product,
        quantity,
        sizeId,
        message: 'Товар добавлен в корзину'
      })
    }
    
    // Проверяем есть ли уже такой товар с таким же размером в корзине
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
        sizeId: sizeId || null
      }
    })

    if (existingItem) {
      // Обновляем количество
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: {
          product: {
            include: {
              sizes: {
                include: {
                  size: true
                }
              },
              color: true
            }
          }
        },
      })
      return NextResponse.json(updatedItem)
    } else {
      // Создаем новый элемент корзины
      const newItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          quantity,
          sizeId: sizeId || null
        },
        include: {
          product: {
            include: {
              sizes: {
                include: {
                  size: true
                }
              },
              color: true
            }
          }
        },
      })
      return NextResponse.json(newItem)
    }

  } catch (error) {
    console.error('Ошибка добавления в корзину:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Очистить корзину
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка очистки корзины:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 