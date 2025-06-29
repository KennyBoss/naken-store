import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { randomInt } from 'crypto'

// Функция для нормализации номера телефона
const normalizePhone = (phone: string): string => {
  // Удаляем все, кроме цифр
  let digits = phone.replace(/\D/g, '');
  // Если номер начинается с 8, заменяем на 7
  if (digits.startsWith('8')) {
    digits = '7' + digits.substring(1);
  }
  // Если не начинается с 7, добавляем 7 (для номеров из 10 цифр)
  if (digits.length === 10) {
    digits = '7' + digits;
  }
  return `+${digits}`;
}


export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Номер телефона обязателен' }, { status: 400 })
    }

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length !== 12) { // +7 и 10 цифр
        return NextResponse.json({ error: 'Неверный формат номера телефона' }, { status: 400 });
    }
    
    // Генерируем 4-значный код
    const code = randomInt(1000, 9999).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // Код действителен 10 минут

    // Удаляем старые коды для этого номера
    await prisma.verificationToken.deleteMany({
        where: { identifier: normalizedPhone }
    });
    
    // Сохраняем новый код в базу
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedPhone,
        token: code, 
        expires,
      },
    })
    
    // !!! ВАЖНО: В реальном приложении здесь будет отправка СМС с кодом
    // Для разработки выводим код в консоль сервера
    console.log(`\n\n--- КОД ПОДТВЕРЖДЕНИЯ ДЛЯ ${normalizedPhone}: ${code} ---\n\n`);

    return NextResponse.json({ message: 'Код подтверждения отправлен' })

  } catch (error) {
    console.error('Ошибка отправки кода:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
} 