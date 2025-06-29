import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/colors - Получить все цвета
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const colors = await prisma.color.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(colors)
  } catch (error) {
    console.error('Ошибка получения цветов:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// POST /api/admin/colors - Создать новый цвет
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const data = await request.json()
    
    if (!data.name || !data.hexCode) {
      return NextResponse.json({ error: 'Не заполнены обязательные поля' }, { status: 400 })
    }

    const color = await prisma.color.create({
      data: {
        name: data.name,
        hexCode: data.hexCode
      }
    })

    return NextResponse.json(color)
  } catch (error) {
    console.error('Ошибка создания цвета:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
} 