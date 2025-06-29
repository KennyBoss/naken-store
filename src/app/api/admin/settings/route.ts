import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/admin/settings - Получить все настройки сайта
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    // @ts-ignore - временно игнорируем ошибку типов после миграции
    const settings = await prisma.siteSettings.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    // Преобразуем в объект для удобства
    const settingsObject = settings.reduce((acc: Record<string, any>, setting: any) => {
      acc[setting.key] = {
        value: setting.value,
        type: setting.type,
        category: setting.category,
        description: setting.description
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({ settings: settingsObject })

  } catch (error) {
    console.error('Ошибка получения настроек:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// POST /api/admin/settings - Обновить настройки сайта
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    const { settings } = await request.json()

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Некорректные данные' },
        { status: 400 }
      )
    }

    // Обновляем каждую настройку
    const updatePromises = Object.entries(settings).map(async ([key, data]: [string, any]) => {
      // @ts-ignore - временно игнорируем ошибку типов после миграции
      return prisma.siteSettings.upsert({
        where: { key },
        update: {
          value: data.value,
          type: data.type || 'text',
          category: data.category || 'general',
          description: data.description
        },
        create: {
          key,
          value: data.value,
          type: data.type || 'text',
          category: data.category || 'general',
          description: data.description
        }
      })
    })

    await Promise.all(updatePromises)

    return NextResponse.json({ 
      message: 'Настройки успешно обновлены' 
    })

  } catch (error) {
    console.error('Ошибка обновления настроек:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 