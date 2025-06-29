import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Отправка сообщения
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { sessionId, content, messageType = 'TEXT', attachments } = body

    if (!sessionId || !content) {
      return NextResponse.json(
        { success: false, error: 'Не указаны обязательные поля' },
        { status: 400 }
      )
    }

    // Проверяем существование чат-сессии
    const chatSession = await prisma.chatSession.findUnique({
      where: { sessionId },
      include: { user: true }
    })

    if (!chatSession) {
      return NextResponse.json(
        { success: false, error: 'Чат-сессия не найдена' },
        { status: 404 }
      )
    }

    // Определяем тип отправителя
    let senderType = 'USER'
    if (session?.user?.role === 'ADMIN') {
      senderType = 'ADMIN'
    }

    // Создаем сообщение
    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        sessionId: chatSession.id,
        senderId: session?.user?.id || null,
        senderType: senderType as any,
        senderName: session?.user?.name || 'Анонимный пользователь',
        messageType: messageType as any,
        attachments: attachments ? JSON.stringify(attachments) : null
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    // Обновляем время последней активности в сессии
    await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: { 
        lastActivity: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: message
    })

  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка отправки сообщения' },
      { status: 500 }
    )
  }
}

// Получение сообщений
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const lastMessageId = searchParams.get('lastMessageId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Не указан ID сессии' },
        { status: 400 }
      )
    }

    // Проверяем существование сессии
    const chatSession = await prisma.chatSession.findUnique({
      where: { sessionId }
    })

    if (!chatSession) {
      return NextResponse.json(
        { success: false, error: 'Чат-сессия не найдена' },
        { status: 404 }
      )
    }

    // Строим запрос для получения сообщений
    const whereClause: any = {
      sessionId: chatSession.id
    }

    // Если указан ID последнего сообщения, получаем только новые
    if (lastMessageId) {
      whereClause.id = {
        gt: lastMessageId
      }
    }

    const messages = await prisma.chatMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        sender: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      messages: messages
    })

  } catch (error) {
    console.error('Ошибка получения сообщений:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка получения сообщений' },
      { status: 500 }
    )
  }
}

// Обновление статуса прочтения сообщений
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { sessionId, messageIds } = body

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Не указан ID сессии' },
        { status: 400 }
      )
    }

    // Проверяем существование сессии
    const chatSession = await prisma.chatSession.findUnique({
      where: { sessionId }
    })

    if (!chatSession) {
      return NextResponse.json(
        { success: false, error: 'Чат-сессия не найдена' },
        { status: 404 }
      )
    }

    // Обновляем статус прочтения
    const whereClause: any = {
      sessionId: chatSession.id,
      isRead: false
    }

    // Если указаны конкретные сообщения
    if (messageIds && Array.isArray(messageIds)) {
      whereClause.id = { in: messageIds }
    }

    await prisma.chatMessage.updateMany({
      where: whereClause,
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Статус прочтения обновлен'
    })

  } catch (error) {
    console.error('Ошибка обновления статуса прочтения:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления статуса' },
      { status: 500 }
    )
  }
} 