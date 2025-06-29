import crypto from 'crypto'

// Интерфейсы для T-Bank API
interface TBankPaymentData {
  Amount: number
  OrderId: string
  Description?: string
  CustomerKey?: string
  NotificationURL?: string
  SuccessURL?: string
  FailURL?: string
  PayType?: 'O' // O - одностадийный платеж
  Receipt?: any // Для фискализации
}

interface TBankInitResponse {
  Success: boolean
  ErrorCode?: string
  Message?: string
  Details?: string
  PaymentId?: string
  PaymentURL?: string
}

// Генерация токена для T-Bank API (исправленный алгоритм согласно документации)
function generateToken(params: Record<string, any>, password: string): string {
  console.log('🔐 T-Bank исходные параметры:', params)
  
  // 1. Собираем только КОРНЕВЫЕ параметры (исключая вложенные объекты и массивы)
  const rootParams: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(params)) {
    // Исключаем Token, Receipt, DATA (объекты) согласно документации T-Bank
    if (key !== 'Token' && key !== 'Receipt' && key !== 'DATA') {
      // Добавляем только скалярные значения
      if (typeof value !== 'object' || value === null) {
        rootParams[key] = value
      }
    }
  }
  
  // 2. Добавляем Password к параметрам для сортировки
  rootParams.Password = password
  
  console.log('🔐 T-Bank только корневые параметры + пароль:', rootParams)
  
  // 3. Сортируем параметры по ключу
  const sortedKeys = Object.keys(rootParams).sort()
  console.log('🔐 T-Bank отсортированные ключи:', sortedKeys)
  
  // 4. Конкатенируем ТОЛЬКО значения в одну строку
  let concatenatedString = ''
  sortedKeys.forEach(key => {
    const value = rootParams[key]
    if (value !== undefined && value !== null && value !== '') {
      concatenatedString += value
    }
  })
  
  console.log('🔐 T-Bank строка для подписи:', concatenatedString)
  
  // 5. Создаем SHA-256 хеш
  const token = crypto.createHash('sha256').update(concatenatedString, 'utf8').digest('hex')
  console.log('🔐 T-Bank сгенерированный токен:', token)
  
  return token
}

// Форматирование телефона для T-Bank (должен быть в формате +79999999999)
function formatPhoneForTBank(phone?: string): string {
  if (!phone) return '+79999999999'
  
  // Убираем все не-цифры
  const digits = phone.replace(/\D/g, '')
  
  // Если начинается с 8, меняем на 7
  const normalized = digits.startsWith('8') ? '7' + digits.slice(1) : digits
  
  // Добавляем + если нет
  return normalized.startsWith('+') ? normalized : '+' + normalized
}

// Валидация email
function validateEmail(email?: string): string {
  if (!email) return 'no-reply@naken-store.com'
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    console.log('⚠️ Invalid email provided:', email, 'using default')
    return 'no-reply@naken-store.com'
  }
  
  return email
}

// Инициализация платежа в T-Bank
export async function createTBankPayment(
  amount: number, 
  orderId: string, 
  customerEmail?: string,
  orderItems?: Array<{
    name: string
    price: number
    quantity: number
  }>,
  customerPhone?: string,
  shippingCost?: number
): Promise<TBankInitResponse> {
  
  // Используем персональные тестовые данные от T-Bank
  const terminalKey = process.env.TBANK_TERMINAL_KEY!
  const password = process.env.TBANK_PASSWORD!
  
  if (!terminalKey || !password) {
    throw new Error('T-Bank credentials not configured')
  }

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://securepay.tinkoff.ru/v2/' 
    : 'https://rest-api-test.tinkoff.ru/v2/'

  // Подготавливаем товары для чека
  let items = []
  let totalItemsAmount = 0
  
  if (orderItems && orderItems.length > 0) {
    // Если переданы конкретные товары - используем их
    items = orderItems.map(item => {
      const itemAmount = Math.round(item.price * item.quantity * 100)
      totalItemsAmount += itemAmount
      return {
        Name: item.name,
        Price: Math.round(item.price * 100), // в копейках
        Quantity: item.quantity,
        Amount: itemAmount, // в копейках
        Tax: 'vat0', // НДС 0%
        PaymentMethod: 'full_payment',
        PaymentObject: 'commodity'
      }
    })
    
    // Добавляем доставку как отдельную позицию, если есть
    if (shippingCost && shippingCost > 0) {
      const shippingAmount = Math.round(shippingCost * 100)
      items.push({
        Name: 'Доставка',
        Price: shippingAmount,
        Quantity: 1,
        Amount: shippingAmount,
        Tax: 'vat0',
        PaymentMethod: 'full_payment',
        PaymentObject: 'service'
      })
      totalItemsAmount += shippingAmount
    }
  } else {
    // Иначе создаем один общий товар
    const totalAmount = Math.round(amount * 100)
    items = [{
      Name: 'Товар из магазина NAKEN',
      Price: totalAmount,
      Quantity: 1,
      Amount: totalAmount,
      Tax: 'vat0', // НДС 0%
      PaymentMethod: 'full_payment',
      PaymentObject: 'commodity'
    }]
    totalItemsAmount = totalAmount
  }
  
  // Проверяем, что сумма позиций в чеке равна общей сумме заказа
  const orderAmountCopecks = Math.round(amount * 100)
  if (totalItemsAmount !== orderAmountCopecks) {
    console.warn(
      `⚠️ T-Bank: сумма позиций в чеке (${totalItemsAmount}) не равна общей сумме (${orderAmountCopecks})`,
      { items, shippingCost, amount }
    )
    
    // Корректируем последнюю позицию, чтобы суммы совпали
    if (items.length > 0) {
      const diff = orderAmountCopecks - totalItemsAmount
      items[items.length - 1].Amount += diff
      items[items.length - 1].Price += diff
    }
  }

  // Параметры для инициализации платежа с фискализацией
  const paymentData: TBankPaymentData & { TerminalKey: string; DATA?: any } = {
    TerminalKey: terminalKey,
    Amount: Math.round(amount * 100), // T-Bank принимает сумму в копейках
    OrderId: orderId,
    Description: `Заказ #${orderId} в магазине NAKEN`,
    PayType: 'O', // Одностадийный платеж
    NotificationURL: 'https://naken.store/api/tbank/notification' // Webhook для уведомлений
  }

  // 🆕 Для продуктивной среды добавляем все способы оплаты и фискализацию
  if (process.env.NODE_ENV === 'production') {
    // DATA параметр активирует все способы оплаты  
    paymentData.DATA = {
      connection_type: 'naken_store_api',
      Email: validateEmail(customerEmail),
      Phone: formatPhoneForTBank(customerPhone)
    }
    
    // Receipt для фискализации
    paymentData.Receipt = {
      Email: validateEmail(customerEmail),
      Phone: formatPhoneForTBank(customerPhone),
      Taxation: 'usn_income', // УСН доходы (без НДС)
      Items: items
    }
    
    console.log('🚀 T-Bank Production: включены все способы оплаты + фискализация')
  } else {
    console.log('🧪 T-Bank Test: только банковские карты, без чека')
  }

  // Логируем данные чека для отладки
  console.log('📋 T-Bank Receipt:', JSON.stringify(paymentData.Receipt, null, 2))

  // Убираем undefined значения
  Object.keys(paymentData).forEach(key => {
    if (paymentData[key as keyof typeof paymentData] === undefined) {
      delete paymentData[key as keyof typeof paymentData]
    }
  })

  // Генерируем токен
  const token = generateToken(paymentData, password)
  
  const requestBody = {
    ...paymentData,
    Token: token
  }
  
  console.log('🏦 T-Bank Request Body:', JSON.stringify(requestBody, null, 2))
  
  try {
    const response = await fetch(`${baseUrl}Init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    const result: TBankInitResponse = await response.json()
    
    console.log('T-Bank Init Response:', result)
    
    if (!result.Success) {
      throw new Error(`T-Bank Error: ${result.ErrorCode} - ${result.Message}`)
    }

    return result
    
  } catch (error) {
    console.error('T-Bank payment creation error:', error)
    throw error
  }
}

// Получение статуса платежа
export async function getTBankPaymentStatus(paymentId: string): Promise<any> {
  // Используем персональные тестовые данные от T-Bank
  const terminalKey = process.env.TBANK_TERMINAL_KEY!
  const password = process.env.TBANK_PASSWORD!
  
  if (!terminalKey || !password) {
    throw new Error('T-Bank credentials not configured')
  }

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://securepay.tinkoff.ru/v2/' 
    : 'https://rest-api-test.tinkoff.ru/v2/'

  const params = {
    TerminalKey: terminalKey,
    PaymentId: paymentId
  }

  const token = generateToken(params, password)

  try {
    const response = await fetch(`${baseUrl}GetState`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        Token: token
      })
    })

    return await response.json()
    
  } catch (error) {
    console.error('T-Bank status check error:', error)
    throw error
  }
}

// Проверка подписи уведомления от T-Bank
export function verifyTBankNotification(notification: any, password: string): boolean {
  const receivedToken = notification.Token
  delete notification.Token
  
  const calculatedToken = generateToken(notification, password)
  
  return receivedToken === calculatedToken
} 