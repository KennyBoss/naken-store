import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { telegramBot } from '@/lib/telegram'

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

      // Генерируем номер заказа для простого заказа
      const orderNumber = `SIMPLE-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

      // Создаем заказ
      const orderData: any = {
        orderNumber,
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
        orderData.comment = `${comment || ''}\n\nАдрес доставки:\n${address.fullName}\n${address.street}\n${address.city || 'Не указан'}\nТел: ${address.phone}`
      }

      const order = await tx.order.create({
        data: orderData,
        include: {
          shippingAddress: true,
          user: {
            select: { name: true, phone: true, email: true }
          }
        }
      })

      // Добавляем товары в заказ и подготавливаем данные для Telegram
      const orderItems = []
      const orderItemsForTelegram = []

      for (const item of items) {
        // Получаем информацию о товаре
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })

        orderItems.push({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })

        // Данные для Telegram
        orderItemsForTelegram.push({
          productName: product?.name || `Товар ID: ${item.productId}`,
          quantity: item.quantity,
          price: item.price
        })
      }

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

      // 🚀 TELEGRAM УВЕДОМЛЕНИЕ: отправляем уведомление о новом простом заказе
      try {
        const fullAddress = validUserId && order.shippingAddress 
          ? `${order.shippingAddress.street}, ${order.shippingAddress.city}${order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}${order.shippingAddress.zipCode ? `, ${order.shippingAddress.zipCode}` : ''}`
          : `${address.street}, ${address.city || 'Не указан'}`

        await telegramBot.sendOrderNotification({
          orderNumber: order.orderNumber,
          customerName: order.user?.name || address.fullName,
          customerPhone: order.user?.phone || address.phone,
          customerEmail: order.user?.email || undefined,
          total: order.total,
          items: orderItemsForTelegram,
          address: fullAddress,
          paymentMethod: paymentMethod || undefined,
          shippingMethod: shippingMethod || undefined
        })
      } catch (telegramError) {
        console.error('❌ Ошибка отправки Telegram уведомления о простом заказе:', telegramError)
        // Не прерываем создание заказа из-за ошибки Telegram
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