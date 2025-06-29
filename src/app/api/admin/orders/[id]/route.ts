import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    const { status } = await request.json()
    const { id } = await context.params
    
    // Проверяем валидность статуса
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Некорректный статус заказа' },
        { status: 400 }
      )
    }
    
    const order = await prisma.order.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { 
            name: true, 
            email: true, 
            phone: true 
          }
        },
        items: {
          include: {
            product: {
              select: { 
                name: true, 
                sku: true 
              }
            }
          }
        },
        shippingAddress: true
      }
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Ошибка обновления заказа:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    const { id } = await context.params
    
    // Проверяем существование заказа
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true
      }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    // Удаляем заказ с каскадным удалением связанных записей
    await prisma.$transaction(async (tx) => {
      // Удаляем элементы заказа
      await tx.orderItem.deleteMany({
        where: { orderId: id }
      })

      // Удаляем адрес доставки, если он существует
      if (existingOrder.shippingAddressId) {
        await tx.address.deleteMany({
          where: { id: existingOrder.shippingAddressId }
        })
      }

      // Удаляем сам заказ
      await tx.order.delete({
        where: { id }
      })
    })

    return NextResponse.json({ 
      success: true,
      message: 'Заказ успешно удален' 
    })
  } catch (error) {
    console.error('Ошибка удаления заказа:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении заказа' },
      { status: 500 }
    )
  }
} 