import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const data = await request.json()

    const { items, address, shippingMethod, paymentMethod, comment, totalAmount } = data

    // Валидация
    if (!items || items.length === 0 || !address || !totalAmount) {
      return NextResponse.json({ error: 'Отсутствуют необходимые данные для создания заказа' }, { status: 400 })
    }

    // Создаем заказ в транзакции
    const newOrder = await prisma.$transaction(async (tx) => {
      // Для авторизованных пользователей проверяем, существует ли пользователь в БД
      let validUserId = null
      if (session?.user?.id) {
        const userExists = await tx.user.findUnique({
          where: { id: session.user.id }
        })
        if (userExists) {
          validUserId = session.user.id
        }
      }

      // Создаем заказ
      const orderData: any = {
        total: totalAmount,
        status: 'PENDING',
        shippingMethod,
        paymentMethod,
        comment,
      }

      // Если есть валидный пользователь, привязываем заказ к нему
      if (validUserId) {
        orderData.user = {
          connect: { id: validUserId }
        }
        // Создаем адрес с привязкой к пользователю
        orderData.shippingAddress = {
          create: {
            name: address.fullName,
            street: address.street,
            city: address.city || 'Не указан',
            state: address.state || '',
            zipCode: address.zipCode || '',
            country: address.country || 'Россия',
            phone: address.phone,
            user: {
              connect: { id: validUserId }
            }
          }
        }
      } else {
        // Для неавторизованных сохраняем адрес прямо в заказе
        // Пока не создаем отдельную запись Address
        orderData.comment = `${comment || ''}\n\nАдрес доставки:\n${address.fullName}\n${address.street}\n${address.city || 'Не указан'}\nТел: ${address.phone}`
      }

      const order = await tx.order.create({
        data: orderData,
        include: {
          shippingAddress: true
        }
      })

      // Добавляем товары в заказ
      const orderItems = items.map((item: any) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))

      await tx.orderItem.createMany({
        data: orderItems
      })
      
      // Обновляем стоки товаров
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      return order
    })

    // TODO: Отправка email-уведомления клиенту и админу

    return NextResponse.json({ 
      message: 'Заказ успешно создан', 
      order: newOrder 
    }, { status: 201 })

  } catch (error) {
    console.error('Ошибка создания быстрого заказа:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
} 