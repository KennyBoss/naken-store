import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/sizes - Получить все размеры
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const sizes = await prisma.size.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(sizes)
  } catch (error) {
    console.error('Ошибка получения размеров:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// POST /api/admin/sizes - Создать новый размер
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const data = await request.json()
    
    if (!data.name || !data.russianSize) {
      return NextResponse.json({ error: 'Не заполнены обязательные поля' }, { status: 400 })
    }

    const size = await prisma.size.create({
      data: {
        name: data.name,
        russianSize: data.russianSize
      }
    })

    return NextResponse.json(size)
  } catch (error) {
    console.error('Ошибка создания размера:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
} 