import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    // Проверяем права админа (можете добавить проверку роли если нужно)
    
    // Проверяем наличие переменных окружения
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID
    
    const configured = !!(botToken && chatId)
    
    return NextResponse.json({
      configured,
      details: {
        hasToken: !!botToken,
        hasChatId: !!chatId,
        tokenPreview: botToken ? `${botToken.substring(0, 8)}...` : 'не задан',
        chatId: chatId || 'не задан'
      }
    })

  } catch (error) {
    console.error('Ошибка проверки статуса Telegram:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 