import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { emailTemplates } from '@/lib/email-templates'

// GET /api/orders - Получить заказы пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        shippingAddress: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)

  } catch (error) {
    console.error('Ошибка получения заказов:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Создать новый заказ
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const {
      items,
      address,
      shippingMethod,
      paymentMethod,
      notes
    } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Корзина не может быть пустой' },
        { status: 400 }
      )
    }

    if (!address || !address.street || !address.city) {
      return NextResponse.json(
        { error: 'Необходимо указать адрес доставки' },
        { status: 400 }
      )
    }

    // Создаем или находим адрес
    let addressRecord = await prisma.address.findFirst({
      where: {
        userId: session.user.id,
        street: address.street,
        city: address.city,
        zipCode: address.zipCode || ''
      }
    })

    if (!addressRecord) {
      addressRecord = await prisma.address.create({
        data: {
          userId: session.user.id,
          name: `${address.firstName} ${address.lastName}`,
          street: address.street,
          city: address.city,
          state: address.state || '',
          zipCode: address.zipCode || '',
          country: address.country || 'Россия',
          phone: address.phone || ''
        }
      })
    }

    // Вычисляем общую стоимость
    let total = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return NextResponse.json(
          { error: `Товар с ID ${item.productId} не найден` },
          { status: 404 }
        )
      }

      const price = product.salePrice || product.price
      const itemTotal = price * item.quantity
      total += itemTotal

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: price,
        size: item.size || null,
        color: item.color || null
      })
    }

    // Добавляем стоимость доставки
    const shippingFee = shippingMethod === 'express' ? 500 : 0
    total += shippingFee

    // Генерируем номер заказа
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Создаем заказ
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        shippingAddressId: addressRecord.id,
        status: 'PENDING',
        total,

        items: {
          create: orderItems
        }
      },
              include: {
        items: {
          include: {
            product: true
          }
        },
        shippingAddress: true
      }
    })

    // Очищаем корзину пользователя
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id }
    })

    // 📧 Email подтверждения будет отправлен после успешной оплаты через webhook
    console.log(`📋 Заказ ${orderNumber} создан, ожидает оплаты...`)

    return NextResponse.json({
      success: true,
      order,
      message: `Заказ ${orderNumber} успешно создан`
    })

  } catch (error) {
    console.error('Ошибка создания заказа:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 