import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Создание новой чат-сессии
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { subject, message, clientInfo } = body

    // Получаем информацию о клиенте
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'Unknown'

    const clientData = {
      userAgent,
      ip,
      timestamp: new Date().toISOString(),
      ...clientInfo
    }

    // Создаем чат-сессию
    const chatSession = await prisma.chatSession.create({
      data: {
        subject: subject || 'Общий вопрос',
        userId: session?.user?.id || null,
        clientInfo: JSON.stringify(clientData),
        source: 'website',
      }
    })

    // Если есть первое сообщение, создаем его
    if (message && message.trim()) {
      await prisma.chatMessage.create({
        data: {
          content: message,
          sessionId: chatSession.id,
          senderId: session?.user?.id || null,
          senderType: session?.user ? 'USER' : 'USER',
          senderName: session?.user?.name || 'Анонимный пользователь',
          messageType: 'TEXT'
        }
      })
    }

    // Создаем приветственное системное сообщение
    await prisma.chatMessage.create({
      data: {
        content: 'Здравствуйте! Спасибо за обращение в NAKEN Store. Наши менеджеры ответят вам в ближайшее время.',
        sessionId: chatSession.id,
        senderType: 'SYSTEM',
        messageType: 'SYSTEM',
        isRead: false
      }
    })

    return NextResponse.json({
      success: true,
      sessionId: chatSession.sessionId,
      message: 'Чат-сессия создана успешно'
    })

  } catch (error) {
    console.error('Ошибка создания чат-сессии:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка создания чат-сессии' },
      { status: 500 }
    )
  }
}

// Получение информации о сессии
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Не указан ID сессии' },
        { status: 400 }
      )
    }

    const chatSession = await prisma.chatSession.findUnique({
      where: { sessionId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        assignedUser: {
          select: { id: true, name: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: { id: true, name: true, image: true }
            }
          }
        }
      }
    })

    if (!chatSession) {
      return NextResponse.json(
        { success: false, error: 'Чат-сессия не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session: chatSession
    })

  } catch (error) {
    console.error('Ошибка получения чат-сессии:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка получения чат-сессии' },
      { status: 500 }
    )
  }
} 