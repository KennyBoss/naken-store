import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createTBankPayment } from '@/lib/tbank'
import { addSecurityHeaders } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    const { orderId, amount, customerEmail, customerPhone } = body

    if (!orderId || !amount) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Отсутствуют обязательные параметры' }, { status: 400 })
      )
    }

    // Проверяем существование заказа
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
      )
    }

    // Проверяем права доступа (если пользователь авторизован)
    if (session && order.userId && order.userId !== session.user.id) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
      )
    }

    // Проверяем что заказ еще не оплачен
    if (order.status === 'DELIVERED' || order.status === 'PROCESSING') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Заказ уже оплачен' }, { status: 400 })
      )
    }

    console.log('Creating T-Bank payment for order:', orderId, 'amount from body:', amount, 'order.total:', order.total)

    // Подготавливаем информацию о товарах для чека
    const orderItems = order.items.map(item => ({
      name: item.product.name,
      price: item.price,
      quantity: item.quantity
    }))

    // Вычисляем стоимость доставки (разность между общей суммой и суммой товаров)
    const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shippingCost = order.total - itemsTotal
    
    console.log(`💰 Расчет суммы заказа: товары=${itemsTotal}₽, доставка=${shippingCost}₽, итого=${order.total}₽`)

    // 🐛 FIX: Используем order.total из базы данных вместо amount из body
    const correctAmount = order.total
    console.log(`🔧 Исправление: используем order.total=${correctAmount}₽ вместо amount=${amount}`)

    // Создаем платеж в T-Bank
    const payment = await createTBankPayment(
      correctAmount,
      orderId,
      customerEmail || order.user?.email,
      orderItems,
      customerPhone || order.user?.phone || undefined,
      shippingCost > 0 ? shippingCost : undefined
    )

    if (!payment.Success || !payment.PaymentURL) {
      throw new Error(`Ошибка создания платежа: ${payment.Message}`)
    }

    // Сохраняем информацию о платеже в базу
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          // Временно сохраняем в comment до применения миграции на продакшене
          comment: `T-Bank PaymentId: ${payment.PaymentId}`,
          // TODO: После применения миграции раскомментировать:
          // paymentId: payment.PaymentId,
          // paymentMethod: 'tbank', 
          // paymentStatus: 'PENDING'
        }
      })
      console.log(`💾 Заказ ${orderId} обновлен с paymentId: ${payment.PaymentId}`)
    } catch (dbError) {
      console.error('Failed to update order with payment info:', dbError)
      // Не прерываем процесс, просто логируем
    }

    console.log('T-Bank payment created successfully:', payment.PaymentId)

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        paymentId: payment.PaymentId,
        paymentUrl: payment.PaymentURL,
        message: 'Платеж успешно создан'
      })
    )

  } catch (error) {
    console.error('T-Bank payment creation error:', error)
    
    return addSecurityHeaders(
      NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Ошибка создания платежа'
      }, { status: 500 })
    )
  }
} 