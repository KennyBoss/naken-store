import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  console.log('🔥 ТЕСТОВЫЙ API ВЫЗВАН!')
  
  try {
    const body = await request.json()
    console.log('📞 Данные получены:', body)
    
    const { phone, password } = body
    
    if (!phone || !password) {
      console.log('❌ Нет телефона или пароля')
      return NextResponse.json({ error: 'Нет данных' }, { status: 400 })
    }
    
    // Ищем админа в БД
    const admin = await prisma.user.findUnique({
      where: { phone }
    })
    
    console.log('🔍 Админ найден:', admin ? 'ДА' : 'НЕТ')
    
    if (!admin) {
      console.log('❌ Админ не найден:', phone)
      return NextResponse.json({ error: 'Админ не найден' }, { status: 404 })
    }
    
    console.log('📋 Роль:', admin.role)
    console.log('🔑 Пароль в базе:', admin.password ? admin.password.substring(0, 10) + '...' : 'НЕТ')
    
    // Проверяем роль
    if (admin.role !== 'ADMIN') {
      console.log('❌ Не админ:', admin.role)
      return NextResponse.json({ error: 'Не админ' }, { status: 403 })
    }
    
    // Проверяем пароль
    let isValid = false
    
    if (admin.password?.startsWith('$2a$') || admin.password?.startsWith('$2b$')) {
      console.log('🔍 Хешированный пароль')
      const bcrypt = await import('bcryptjs')
      isValid = await bcrypt.compare(password, admin.password)
    } else {
      console.log('🔍 Текстовый пароль')
      isValid = password === admin.password
    }
    
    console.log('✅ Пароль верный:', isValid)
    
    if (!isValid) {
      console.log('❌ Неверный пароль')
      return NextResponse.json({ 
        error: 'Неверный пароль',
        debug: {
          введенный: password,
          вБазе: admin.password?.substring(0, 10) + '...'
        }
      }, { status: 401 })
    }
    
    console.log('🎉 АВТОРИЗАЦИЯ УСПЕШНА!')
    
    return NextResponse.json({ 
      success: true,
      admin: {
        id: admin.id,
        phone: admin.phone,
        role: admin.role
      }
    })
    
  } catch (error) {
    console.error('💥 Ошибка в тестовом API:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
} 