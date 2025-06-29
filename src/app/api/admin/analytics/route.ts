import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

// GET /api/admin/analytics - Получить аналитические данные
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7' // дней назад
    const days = parseInt(range)
    
    const startDate = startOfDay(subDays(new Date(), days))
    const endDate = endOfDay(new Date())

    // 📊 1. Регистрации по дням
    const registrations = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        role: 'USER',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    })

    const registrationsByDay = registrations.reduce((acc: any, reg) => {
      const day = format(reg.createdAt, 'yyyy-MM-dd')
      acc[day] = (acc[day] || 0) + reg._count.id
      return acc
    }, {})

    // Заполняем пропущенные дни нулями
    const registrationData = []
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const day = format(date, 'yyyy-MM-dd')
      registrationData.push({
        date: day,
        registrations: registrationsByDay[day] || 0,
        label: format(date, 'dd.MM')
      })
    }

    // 📊 2. Конверсия авторизации
    const authStats = await prisma.authLog.groupBy({
      by: ['type', 'success'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    })

    const authConversion = authStats.reduce((acc: any, stat) => {
      const type = stat.type
      if (!acc[type]) {
        acc[type] = { total: 0, success: 0 }
      }
      acc[type].total += stat._count.id
      if (stat.success) {
        acc[type].success += stat._count.id
      }
      return acc
    }, {})

    const conversionData = Object.entries(authConversion).map(([type, data]: [string, any]) => ({
      type,
      total: data.total,
      success: data.success,
      conversion: data.total > 0 ? Math.round((data.success / data.total) * 100) : 0
    }))

    // 📊 3. Активность пользователей (топ 10)
    const userActivity = await prisma.userActivity.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    const activityData = await Promise.all(
      userActivity.map(async (activity) => {
        const user = await prisma.user.findUnique({
          where: { id: activity.userId },
          select: { phone: true, email: true, name: true }
        })
        return {
          userId: activity.userId,
          activities: activity._count.id,
          contact: user?.phone || user?.email || 'Неизвестно',
          name: user?.name || 'Пользователь'
        }
      })
    )

    // 📊 4. Продажи по пользователям
    const salesByUser = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['DELIVERED', 'PROCESSING', 'SHIPPED']
        }
      },
      _sum: {
        total: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          total: 'desc'
        }
      },
      take: 10
    })

    const salesData = await Promise.all(
      salesByUser.map(async (sale) => {
        const user = await prisma.user.findUnique({
          where: { id: sale.userId || '' },
          select: { phone: true, email: true, name: true }
        })
        return {
          userId: sale.userId,
          totalSales: sale._sum.total || 0,
          orderCount: sale._count.id,
          contact: user?.phone || user?.email || 'Гость',
          name: user?.name || 'Пользователь'
        }
      })
    )

    // 📊 5. Общая статистика
    const totalUsers = await prisma.user.count({
      where: { role: 'USER' }
    })

    const totalOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const totalRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['DELIVERED', 'PROCESSING', 'SHIPPED']
        }
      },
      _sum: {
        total: true
      }
    })

    const newUsersCount = await prisma.user.count({
      where: {
        role: 'USER',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    return NextResponse.json({
      period: {
        start: format(startDate, 'dd.MM.yyyy'),
        end: format(endDate, 'dd.MM.yyyy'),
        days
      },
      summary: {
        totalUsers,
        newUsers: newUsersCount,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0
      },
      registrations: registrationData,
      authConversion: conversionData,
      userActivity: activityData,
      salesByUser: salesData
    })

  } catch (error) {
    console.error('Ошибка получения аналитики:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 