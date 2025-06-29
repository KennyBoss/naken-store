import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/profile - Получить данные профиля пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }
    
    return NextResponse.json(user)

  } catch (error) {
    console.error('Ошибка получения профиля:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// PUT /api/profile - Обновить данные профиля пользователя
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const { name, phone } = await request.json()

    // Валидация
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Имя должно содержать минимум 2 символа' }, { status: 400 })
    }
    if (!phone || !/^\+?[78]?\(?\d{3}\)?\d{3}-?\d{2}-?\d{2}$/.test(phone)) {
       return NextResponse.json({ error: 'Неверный формат телефона' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name,
        phone: phone
      }
    })

    return NextResponse.json({
      success: true,
      profile: updatedUser,
      message: 'Профиль успешно обновлен'
    })

  } catch (error) {
    console.error('Ошибка обновления профиля:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
} 