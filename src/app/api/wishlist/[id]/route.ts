import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// DELETE /api/wishlist/[id] - Удалить товар из избранного
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

    // Удаляем по productId, а не по id записи wishlist
    // Это удобнее для фронтенда
    const deletedItem = await prisma.wishlistItem.deleteMany({
      where: {
        productId: id,
        userId: session.user.id
      }
    })

    if (deletedItem.count === 0) {
      return NextResponse.json(
        { error: 'Товар не найден в избранном' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Товар удален из избранного'
    })

  } catch (error) {
    console.error('Ошибка удаления из избранного:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 