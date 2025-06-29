import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - получить активные пиксели (публичный endpoint)
export async function GET() {
  try {
    const pixels = await prisma.trackingPixel.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        type: true,
        pixelId: true,
        code: true,
        placement: true,
        isActive: true
      },
      orderBy: { createdAt: 'asc' }
    })

    // Добавляем кэширование на 5 минут
    return NextResponse.json(
      { pixels },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      }
    )
  } catch (error) {
    console.error('Ошибка получения активных пикселей:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера', pixels: [] },
      { status: 500 }
    )
  }
} 