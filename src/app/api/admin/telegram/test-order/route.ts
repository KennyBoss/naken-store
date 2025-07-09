import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { telegramBot } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    // Проверяем права админа (можете добавить проверку роли если нужно)
    
    // Создаем тестовые данные заказа
    const testOrderData = {
      orderNumber: `TEST-${Date.now()}`,
      customerName: 'Иван Тестовый',
      customerPhone: '+7 900 123-45-67',
      customerEmail: 'test@example.com',
      total: 4500,
      items: [
        {
          productName: 'Тестовая куртка зимняя',
          quantity: 1,
          price: 3500
        },
        {
          productName: 'Тестовые перчатки',
          quantity: 2,
          price: 500
        }
      ],
      address: 'г. Москва, ул. Тестовая, д. 123, кв. 45',
      paymentMethod: 'Картой онлайн',
      shippingMethod: 'Курьерская доставка'
    }
    
    // Отправляем тестовое уведомление
    const success = await telegramBot.sendOrderNotification(testOrderData)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Тестовое уведомление о заказе отправлено',
        testData: testOrderData
      })
    } else {
      return NextResponse.json(
        { error: 'Не удалось отправить уведомление' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Ошибка отправки тестового уведомления о заказе:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 