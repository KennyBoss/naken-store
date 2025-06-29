import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params

    const product = await prisma.product.findUnique({
      where: {
        slug: slug,
        published: true,
      },
      include: {
        reviews: true,
        sizes: {
          include: {
            size: true
          }
        },
        color: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      )
    }

    // Возвращаем товар с размером и цветом
    return NextResponse.json(product)

  } catch (error) {
    console.error('Ошибка получения товара:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 