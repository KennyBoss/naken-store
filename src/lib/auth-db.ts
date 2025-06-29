import { prisma } from '@/lib/db'

// Генерация случайного SMS кода (4 цифры)
const generateSMSCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Генерация случайного Email кода (6 цифр)
const generateEmailCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Нормализация номера телефона
const normalizePhone = (phone: string): string => {
  let normalized = phone.replace(/\D/g, '')
  if (normalized.startsWith('8')) {
    normalized = '7' + normalized.substring(1)
  }
  if (normalized.length === 10) {
    normalized = '7' + normalized
  }
  return normalized
}

// Создание SMS кода в БД
export const createSMSCode = async (phone: string): Promise<string> => {
  const normalizedPhone = normalizePhone(phone)
  const code = generateSMSCode()
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 минут

  // Удаляем старые коды для этого номера
  await prisma.authCode.deleteMany({
    where: {
      contact: normalizedPhone,
      type: 'SMS'
    }
  })

  // Создаем новый код
  await prisma.authCode.create({
    data: {
      type: 'SMS',
      contact: normalizedPhone,
      code,
      expires
    }
  })

  console.log(`📱 SMS код создан для +${normalizedPhone}: ${code}`)
  return code
}

// Создание Email кода в БД
export const createEmailCode = async (email: string): Promise<string> => {
  const normalizedEmail = email.toLowerCase()
  const code = generateEmailCode()
  const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 минут

  // Удаляем старые коды для этого email
  await prisma.authCode.deleteMany({
    where: {
      contact: normalizedEmail,
      type: 'EMAIL'
    }
  })

  // Создаем новый код
  await prisma.authCode.create({
    data: {
      type: 'EMAIL',
      contact: normalizedEmail,
      code,
      expires
    }
  })

  console.log(`📧 Email код создан для ${normalizedEmail}: ${code}`)
  return code
}

// Проверка SMS кода из БД
export const verifySMSCodeDB = async (phone: string, code: string): Promise<boolean> => {
  const normalizedPhone = normalizePhone(phone)
  const cleanCode = code.trim() // Убираем пробелы

  console.log(`🔍 Проверка SMS кода из БД:`)
  console.log(`   Телефон: +${normalizedPhone}`)
  console.log(`   Введенный код: "${cleanCode}"`)

  // Ищем код в БД
  const authCode = await prisma.authCode.findFirst({
    where: {
      contact: normalizedPhone,
      type: 'SMS',
      used: false
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`   Найден код: "${authCode?.code || 'НЕТ'}"`)
  console.log(`   Истекает: ${authCode ? authCode.expires.toLocaleString() : 'НЕТ'}`)

  if (!authCode) {
    console.log(`❌ Код не найден для +${normalizedPhone}`)
    return false
  }

  if (authCode.expires <= new Date()) {
    console.log(`❌ Код истек для +${normalizedPhone}`)
    return false
  }

  if (authCode.code !== cleanCode) {
    console.log(`❌ Коды не совпадают: "${authCode.code}" !== "${cleanCode}"`)
    return false
  }

  // Помечаем код как использованный
  await prisma.authCode.update({
    where: { id: authCode.id },
    data: { used: true }
  })

  console.log(`✅ Код верный для +${normalizedPhone}`)
  return true
}

// Проверка Email кода из БД
export const verifyEmailCodeDB = async (email: string, code: string): Promise<boolean> => {
  const normalizedEmail = email.toLowerCase()
  const cleanCode = code.trim() // Убираем пробелы

  console.log(`🔍 Проверка Email кода из БД:`)
  console.log(`   Email: ${normalizedEmail}`)
  console.log(`   Введенный код: "${cleanCode}"`)

  // Ищем код в БД
  const authCode = await prisma.authCode.findFirst({
    where: {
      contact: normalizedEmail,
      type: 'EMAIL',
      used: false
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`   Найден код: "${authCode?.code || 'НЕТ'}"`)
  console.log(`   Истекает: ${authCode ? authCode.expires.toLocaleString() : 'НЕТ'}`)

  if (!authCode) {
    console.log(`❌ Код не найден для ${normalizedEmail}`)
    return false
  }

  if (authCode.expires <= new Date()) {
    console.log(`❌ Код истек для ${normalizedEmail}`)
    return false
  }

  if (authCode.code !== cleanCode) {
    console.log(`❌ Коды не совпадают: "${authCode.code}" !== "${cleanCode}"`)
    return false
  }

  // Помечаем код как использованный
  await prisma.authCode.update({
    where: { id: authCode.id },
    data: { used: true }
  })

  console.log(`✅ Код верный для ${normalizedEmail}`)
  return true
} 