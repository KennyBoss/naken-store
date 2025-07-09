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
    
    const { senderName, message } = await request.json()
    
    // Отправляем тестовое уведомление
    const success = await telegramBot.sendChatNotification({
      sessionId: 'TEST-SESSION-' + Date.now(),
      senderName: senderName || 'Тестовый пользователь',
      message: message || 'Это тестовое сообщение для проверки Telegram уведомлений!',
      isFromUser: false, // Отправляем как от админа
      timestamp: new Date()
    })
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Тестовое уведомление отправлено'
      })
    } else {
      return NextResponse.json(
        { error: 'Не удалось отправить уведомление' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Ошибка отправки тестового уведомления:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 