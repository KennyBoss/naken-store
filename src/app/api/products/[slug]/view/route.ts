import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 🚀 API для трекинга просмотров товаров (важно для SEO аналитики)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Увеличиваем счетчик просмотров
    await prisma.product.update({
      where: { 
        slug: slug,
        published: true 
      },
      data: { 
        views: { increment: 1 } 
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка трекинга просмотра:', error)
    // Возвращаем успех даже при ошибке, чтобы не ломать UX
    return NextResponse.json({ success: true })
  }
} 