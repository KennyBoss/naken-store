import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createYooKassaPayment } from '@/lib/yookassa'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const { amount, orderId, description } = await request.json()

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: 'Неверные параметры' },
        { status: 400 }
      )
    }

    // Создаем платеж в ЮKassa
    const payment = await createYooKassaPayment(amount, orderId)

    if (payment.confirmation?.confirmation_url) {
      return NextResponse.json({
        success: true,
        paymentUrl: payment.confirmation.confirmation_url,
        paymentId: payment.id
      })
    } else {
      return NextResponse.json(
        { error: 'Ошибка создания платежа' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Ошибка ЮKassa:', error)
    return NextResponse.json(
      { error: 'Ошибка платежной системы' },
      { status: 500 }
    )
  }
} 