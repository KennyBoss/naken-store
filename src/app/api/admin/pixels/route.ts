import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - получить все пиксели
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    const pixels = await prisma.trackingPixel.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ pixels })
  } catch (error) {
    console.error('Ошибка получения пикселей:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// POST - создать новый пиксель
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    const {
      name,
      type,
      pixelId,
      code,
      isActive,
      placement,
      description
    } = await request.json()

    // Валидация
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Название и тип пикселя обязательны' },
        { status: 400 }
      )
    }

    if (type !== 'CUSTOM_HTML' && !pixelId) {
      return NextResponse.json(
        { error: 'ID пикселя обязателен для данного типа' },
        { status: 400 }
      )
    }

    const pixel = await prisma.trackingPixel.create({
      data: {
        name,
        type,
        pixelId: pixelId || '',
        code,
        isActive: isActive ?? true,
        placement: placement || 'HEAD',
        description
      }
    })

    return NextResponse.json({ pixel })
  } catch (error) {
    console.error('Ошибка создания пикселя:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 