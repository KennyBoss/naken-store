import axios from 'axios'
import { createSMSCode, verifySMSCodeDB } from '@/lib/auth-db'

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

// Отправка SMS через SMS-Центр
export const sendSMSCode = async (phone: string): Promise<string> => {
  const normalizedPhone = normalizePhone(phone)
  
  // Создаем код в БД
  const code = await createSMSCode(phone)

  // Используем только SMS-Центр
  const smscLogin = process.env.SMSCENTER_LOGIN
  const smscPassword = process.env.SMSCENTER_PASSWORD
  
  if (!smscLogin || !smscPassword) {
    console.log(`\n🔥 SMS КОД ДЛЯ +${normalizedPhone}: ${code}\n`)
    console.log('⚠️  Для продакшена добавьте SMSCENTER_LOGIN и SMSCENTER_PASSWORD в .env')
    return code
  }

  try {
    const smscResponse = await axios.get('https://smsc.ru/sys/send.php', {
      params: {
        login: smscLogin,
        psw: smscPassword,
        phones: normalizedPhone,
        mes: code, // Отправляем только цифры
        fmt: 3, // JSON формат
        sender: 'SMSC', // Стандартное имя отправителя
        translit: 1 // Транслитерация
      }
    })

    console.log('SMS-Центр ответ:', smscResponse.data)

    if (!smscResponse.data.error_code) {
      console.log(`✅ SMS отправлен через SMS-Центр на +${normalizedPhone}`)
      return code
    } else {
      throw new Error(`SMS-Центр error: ${smscResponse.data.error}`)
    }
  } catch (error) {
    console.error('Ошибка отправки SMS:', error)
    // В случае ошибки API, показываем код в консоли
    console.log(`\n🔥 SMS КОД ДЛЯ +${normalizedPhone}: ${code} (fallback)\n`)
    return code
  }
}

// Проверка SMS кода
export const verifySMSCode = async (phone: string, code: string): Promise<boolean> => {
  return await verifySMSCodeDB(phone, code)
}

 