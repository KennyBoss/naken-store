import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT /api/cart/[id] - Обновить количество товара в корзине
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { quantity } = await request.json()

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Неверное количество' },
        { status: 400 }
      )
    }

    // Проверяем что элемент корзины принадлежит пользователю
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Элемент корзины не найден' },
        { status: 404 }
      )
    }

    // Обновляем количество
    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: true
      }
    })

    return NextResponse.json(updatedItem)

  } catch (error) {
    console.error('Ошибка обновления корзины:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart/[id] - Удалить товар из корзины
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Проверяем что элемент корзины принадлежит пользователю
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Элемент корзины не найден' },
        { status: 404 }
      )
    }

    // Удаляем элемент
    await prisma.cartItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Ошибка удаления из корзины:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 