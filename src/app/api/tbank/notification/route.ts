import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyTBankNotification } from '@/lib/tbank'
import { addSecurityHeaders } from '@/lib/security'
import { sendEmail } from '@/lib/email'
import { emailTemplates } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()
    
    console.log('T-Bank notification received:', notification)

    const password = process.env.TBANK_PASSWORD
    if (!password) {
      console.error('T-Bank password not configured')
      return NextResponse.json('ERROR', { status: 500 })
    }

    // Проверяем подпись уведомления
    const isValid = verifyTBankNotification({ ...notification }, password)
    
    if (!isValid) {
      console.error('Invalid T-Bank notification signature')
      return NextResponse.json('ERROR', { status: 400 })
    }

    const { Status, PaymentId, OrderId, Amount } = notification

    if (!OrderId) {
      console.error('Missing OrderId in T-Bank notification')
      return NextResponse.json('ERROR', { status: 400 })
    }

    // Находим заказ с полной информацией
    const order = await prisma.order.findUnique({
      where: { id: OrderId },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
        shippingAddress: true
      }
    })

    if (!order) {
      console.error('Order not found:', OrderId)
      return NextResponse.json('ERROR', { status: 404 })
    }

    console.log(`T-Bank notification for order ${OrderId}: status=${Status}, paymentId=${PaymentId}`)

    // Обрабатываем статус платежа
    let newOrderStatus = order.status
    let newPaymentStatus = 'PENDING'
    let shouldSendEmail = false

    switch (Status) {
      case 'CONFIRMED': // Платеж успешно завершен
        newOrderStatus = 'PROCESSING'
        newPaymentStatus = 'PAID'
        shouldSendEmail = true
        console.log(`✅ Payment confirmed for order ${OrderId}`)
        break
        
      case 'AUTHORIZED': // Платеж авторизован (для двухстадийных платежей)
        newOrderStatus = 'PROCESSING'
        newPaymentStatus = 'PAID'
        shouldSendEmail = true
        console.log(`✅ Payment authorized for order ${OrderId}`)
        break
        
      case 'CANCELED': // Платеж отменен
        newPaymentStatus = 'CANCELLED'
        console.log(`❌ Payment cancelled for order ${OrderId}`)
        break
        
      case 'REJECTED': // Платеж отклонен
        newPaymentStatus = 'FAILED'
        console.log(`❌ Payment rejected for order ${OrderId}`)
        break
        
      case 'DEADLINE_EXPIRED': // Истек срок платежа
        newPaymentStatus = 'EXPIRED'
        console.log(`⏰ Payment expired for order ${OrderId}`)
        break
        
      default:
        console.log(`❓ Unknown payment status for order ${OrderId}: ${Status}`)
        // Не меняем статус для неизвестных статусов
        return NextResponse.json('OK', { status: 200 })
    }

    // Обновляем заказ с новым статусом платежа
    const updateData: any = {
      updatedAt: new Date(),
      comment: order.comment ? 
        `${order.comment}; T-Bank: ${Status} (${PaymentId})` : 
        `T-Bank: ${Status} (${PaymentId})`
    }

    // Обновляем статус заказа если изменился
    if (newOrderStatus !== order.status) {
      updateData.status = newOrderStatus
    }

    // TODO: После применения миграции раскомментировать:
    // updateData.paymentStatus = newPaymentStatus
    // updateData.paymentData = JSON.stringify({
    //   ...JSON.parse(order.paymentData || '{}'),
    //   lastStatus: Status,
    //   lastUpdate: new Date().toISOString()
    // })

    await prisma.order.update({
      where: { id: OrderId },
      data: updateData
    })

    console.log(`📋 Order ${OrderId} updated: ${order.status} → ${newOrderStatus}, payment: ${newPaymentStatus}`)
      
    // Отправляем email подтверждения после успешной оплаты
    if (shouldSendEmail && order.user?.email) {
      try {
        const emailData = emailTemplates.orderConfirmation({
          orderNumber: order.orderNumber,
          customerName: order.user.name || 'Покупатель',
          items: order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price
          })),
          total: order.total,
          shippingAddress: order.shippingAddress ? 
            `${order.shippingAddress.street}, ${order.shippingAddress.city}` : 
            'Адрес не указан',
          paymentMethod: 'T-Bank (банковская карта)'
        })

        await sendEmail(
          order.user.email,
          emailData.subject,
          emailData.html
        )

        console.log(`✅ Email подтверждения отправлен для заказа ${order.orderNumber} после оплаты`)
      } catch (emailError) {
        console.error('❌ Ошибка отправки email после оплаты:', emailError)
        // Не прерываем обработку webhook из-за ошибки email
      }
    }

    // Возвращаем OK для подтверждения получения уведомления
    return addSecurityHeaders(
      NextResponse.json('OK')
    )

  } catch (error) {
    console.error('T-Bank notification processing error:', error)
    
    // Возвращаем ERROR чтобы T-Bank повторил отправку уведомления
    return NextResponse.json('ERROR', { status: 500 })
  }
} 