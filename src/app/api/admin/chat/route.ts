import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Получение всех чат-сессий для админа
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Проверяем права админа
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Фильтры
    const whereClause: any = {}
    if (status && status !== 'ALL') {
      whereClause.status = status
    }

    // Получаем чат-сессии
    const [chatSessions, total] = await Promise.all([
      prisma.chatSession.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true }
          },
          assignedUser: {
            select: { id: true, name: true }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Только последнее сообщение
            include: {
              sender: {
                select: { id: true, name: true }
              }
            }
          },
          _count: {
            select: { 
              messages: true
            }
          }
        },
        orderBy: { lastActivity: 'desc' },
        skip,
        take: limit
      }),
      prisma.chatSession.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      sessions: chatSessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Ошибка получения чат-сессий:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка получения чат-сессий' },
      { status: 500 }
    )
  }
}

// Назначение чата администратору
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Проверяем права админа
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { sessionId, action, assignedTo, status, priority } = body

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

    // Подготавливаем данные для обновления
    const updateData: any = {
      updatedAt: new Date()
    }

    if (action === 'assign' && assignedTo) {
      updateData.assignedTo = assignedTo
      
      // Отправляем системное сообщение о назначении
      await prisma.chatMessage.create({
        data: {
          content: `Чат был назначен администратору ${session.user.name || 'Администратор'}`,
          sessionId: chatSession.id,
          senderType: 'SYSTEM',
          messageType: 'SYSTEM'
        }
      })
    }

    if (status) {
      updateData.status = status
      
      if (status === 'CLOSED') {
        updateData.closedAt = new Date()
        
        // Отправляем системное сообщение о закрытии
        await prisma.chatMessage.create({
          data: {
            content: 'Чат был закрыт администратором. Спасибо за обращение!',
            sessionId: chatSession.id,
            senderType: 'SYSTEM',
            messageType: 'SYSTEM'
          }
        })
      }
    }

    if (priority) {
      updateData.priority = priority
    }

    // Обновляем сессию
    const updatedSession = await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        assignedUser: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      session: updatedSession,
      message: 'Чат-сессия обновлена успешно'
    })

  } catch (error) {
    console.error('Ошибка обновления чат-сессии:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления чат-сессии' },
      { status: 500 }
    )
  }
} 