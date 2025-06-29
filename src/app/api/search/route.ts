import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const searchTerm = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  if (!searchTerm) {
    return NextResponse.json({ error: 'Search term is required' }, { status: 400 })
  }

  try {
    const isPostgres = process.env.DATABASE_URL?.startsWith('postgres')
    
    const where: Prisma.ProductWhereInput = {
      published: true,
      OR: [
        { name: { contains: searchTerm, mode: isPostgres ? 'insensitive' : 'default' } },
        { description: { contains: searchTerm, mode: isPostgres ? 'insensitive' : 'default' } },
        { sku: { contains: searchTerm, mode: isPostgres ? 'insensitive' : 'default' } },
      ],
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        reviews: { select: { rating: true } }
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const productsWithAvgRating = products.map(product => {
      const reviews = (product as any).reviews || []
      const totalReviews = reviews.length
      const averageRating = totalReviews > 0 ? reviews.reduce((acc: any, review: any) => acc + review.rating, 0) / totalReviews : 0
      const { reviews: _, ...productWithoutReviews } = product as any
      return { ...productWithoutReviews, totalReviews, averageRating }
    })

    return NextResponse.json(productsWithAvgRating)

  } catch (error) {
    console.error('Ошибка при поиске:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 