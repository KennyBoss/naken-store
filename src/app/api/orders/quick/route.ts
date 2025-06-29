import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { customerPhone, customerName, customerAddress, comment } = await request.json()

    // Валидация данных
    if (!customerPhone || !customerName || !customerAddress) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      )
    }

    // Генерируем номер заказа
    const orderNumber = `QO-${Date.now()}`

    let userId = null
    
    // Если пользователь авторизован, используем его ID
    if (session?.user?.id) {
      userId = session.user.id
    } else {
      // Если не авторизован, создаем нового пользователя или находим существующего
      let user = await prisma.user.findUnique({
        where: { phone: customerPhone }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            phone: customerPhone,
            name: customerName,
          }
        })
      }
      
      userId = user.id
    }

    // Создаем адрес для заказа
    const address = await prisma.address.create({
      data: {
        name: 'Адрес быстрого заказа',
        street: customerAddress,
        city: '', // Можно извлечь из адреса если нужно
        state: '',
        zipCode: '',
        country: 'Россия',
        phone: customerPhone,
        userId: userId,
      }
    })

    // Создаем заказ
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        shippingAddressId: address.id,
        total: 0, // Будет обновлено после добавления товаров
        status: 'PENDING',
      }
    })

    // В реальном приложении здесь можно:
    // 1. Отправить SMS или уведомление менеджеру
    // 2. Создать заявку в CRM системе
    // 3. Отправить email подтверждение

    console.log(`Быстрый заказ создан: ${orderNumber}`)
    console.log(`Клиент: ${customerName}, ${customerPhone}`)
    console.log(`Адрес: ${customerAddress}`)
    if (comment) {
      console.log(`Комментарий: ${comment}`)
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName,
        customerPhone,
        customerAddress,
        comment
      },
      message: 'Быстрый заказ успешно создан'
    })

  } catch (error) {
    console.error('Ошибка создания быстрого заказа:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера при создании заказа' },
      { status: 500 }
    )
  }
} 