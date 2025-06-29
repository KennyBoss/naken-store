import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { emailTemplates } from '@/lib/email-templates'

// PATCH /api/orders/[id]/status - Обновить статус заказа (только админ)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    // Проверяем права админа
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Недостаточно прав' },
        { status: 403 }
      )
    }

    const { status, statusMessage } = await request.json()
    const { id } = await context.params

    if (!status) {
      return NextResponse.json(
        { error: 'Необходимо указать статус' },
        { status: 400 }
      )
    }

    // Валидация статуса
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Некорректный статус' },
        { status: 400 }
      )
    }

    // Обновляем заказ
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: true
          }
        },
        shippingAddress: true
      }
    })

    // 📧 Отправляем email уведомление о смене статуса
    try {
      if (order.user?.email) {
        const statusMessages: Record<string, string> = {
          PENDING: 'Ваш заказ ожидает обработки',
          CONFIRMED: 'Ваш заказ подтвержден и принят в работу',
          PROCESSING: 'Ваш заказ находится в обработке',
          SHIPPED: 'Ваш заказ отправлен и скоро будет доставлен',
          DELIVERED: 'Ваш заказ успешно доставлен',
          CANCELLED: 'Ваш заказ отменен'
        }

        const emailData = emailTemplates.orderStatusUpdate({
          orderNumber: order.orderNumber,
          customerName: order.user.name || 'Покупатель',
          status: statusMessages[status] || status,
          statusMessage: statusMessage || statusMessages[status] || 'Статус заказа изменен'
        })

        await sendEmail(
          order.user.email,
          emailData.subject,
          emailData.html
        )

        console.log(`✅ Email уведомление отправлено для заказа ${order.orderNumber}`)
      }
    } catch (emailError) {
      console.error('❌ Ошибка отправки email:', emailError)
      // Не прерываем обновление статуса из-за ошибки email
    }

    return NextResponse.json({
      success: true,
      order,
      message: 'Статус заказа обновлен'
    })

  } catch (error) {
    console.error('Ошибка обновления статуса:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 