import { NextRequest, NextResponse } from 'next/server'
import { sendEmailCode } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email адрес обязателен' },
        { status: 400 }
      )
    }

    // Проверяем формат email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Неверный формат email' },
        { status: 400 }
      )
    }

    const code = await sendEmailCode(email)
    
    return NextResponse.json({ 
      success: true,
      message: 'Код отправлен на email'
    })
  } catch (error) {
    console.error('Ошибка отправки email:', error)
    return NextResponse.json(
      { error: 'Не удалось отправить код' },
      { status: 500 }
    )
  }
} 