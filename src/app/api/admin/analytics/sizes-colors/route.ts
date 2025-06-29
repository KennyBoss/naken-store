import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

// GET /api/admin/analytics/sizes-colors - Получить аналитику размеров и цветов
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30'
    const days = parseInt(range)
    
    const startDate = startOfDay(subDays(new Date(), days))
    const endDate = endOfDay(new Date())

    // 📊 Статистика размеров и цветов
    const totalSizes = await prisma.size.count()
    const totalColors = await prisma.color.count()
    
    const activeSizes = await prisma.size.count({
      where: {
        products: {
          some: {
            product: {
              published: true
            }
          }
        }
      }
    })

    const activeColors = await prisma.color.count({
      where: {
        products: {
          some: {
            published: true
          }
        }
      }
    })

    // Получаем все размеры
    const allSizes = await prisma.size.findMany({
      select: {
        id: true,
        name: true,
        russianSize: true
      }
    })

    // Получаем все цвета  
    const allColors = await prisma.color.findMany({
      select: {
        id: true,
        name: true,
        hexCode: true
      }
    })

    // Простые данные для графиков (пока без группировки заказов)
    const sizePopularityData = allSizes.map(size => ({
      size: size.id,
      sizeName: size.name,
      russianSize: size.russianSize,
      orders: Math.floor(Math.random() * 50), // Заглушка на время
      quantity: Math.floor(Math.random() * 200)
    }))

    const colorPopularityData = allColors.map(color => ({
      color: color.id,
      colorName: color.name,
      hexCode: color.hexCode,
      orders: Math.floor(Math.random() * 30), // Заглушка на время
      quantity: Math.floor(Math.random() * 150)
    }))

    return NextResponse.json({
      period: {
        start: format(startDate, 'dd.MM.yyyy'),
        end: format(endDate, 'dd.MM.yyyy'),
        days
      },
      summary: {
        totalSizes,
        totalColors,
        activeSizes,
        activeColors
      },
      sizePopularity: sizePopularityData,
      colorPopularity: colorPopularityData
    })

  } catch (error) {
    console.error('Ошибка получения аналитики размеров и цветов:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 