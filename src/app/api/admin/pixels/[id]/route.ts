import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT - обновить пиксель
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    const { id } = await params
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

    const pixel = await prisma.trackingPixel.update({
      where: { id },
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
    console.error('Ошибка обновления пикселя:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// DELETE - удалить пиксель
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    const { id } = await params

    await prisma.trackingPixel.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка удаления пикселя:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 