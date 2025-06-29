import { NextRequest, NextResponse } from 'next/server'
import { sendSMSCode } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Номер телефона обязателен' },
        { status: 400 }
      )
    }

    const code = await sendSMSCode(phone)
    
    return NextResponse.json({ 
      success: true,
      message: 'Код отправлен'
    })
  } catch (error) {
    console.error('Ошибка отправки SMS:', error)
    return NextResponse.json(
      { error: 'Не удалось отправить код' },
      { status: 500 }
    )
  }
} 