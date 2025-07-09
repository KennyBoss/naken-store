// Telegram Bot API для отправки уведомлений
interface TelegramMessage {
  chat_id: string | number
  text: string
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  disable_web_page_preview?: boolean
}

interface ChatNotification {
  sessionId: string
  senderName: string
  message: string
  isFromUser: boolean
  timestamp: Date
}

interface OrderNotification {
  orderNumber: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  total: number
  items: Array<{
    productName: string
    quantity: number
    price: number
  }>
  address?: string
  paymentMethod?: string
  shippingMethod?: string
}

class TelegramBot {
  private botToken: string
  private chatId: string

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || ''
    this.chatId = process.env.TELEGRAM_CHAT_ID || ''
    
    if (!this.botToken || !this.chatId) {
      console.warn('⚠️ Telegram bot token или chat ID не настроены')
    }
  }

  private async sendMessage(message: TelegramMessage): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      console.log('❌ Telegram не настроен - уведомление пропущено')
      return false
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...message,
          chat_id: this.chatId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Ошибка отправки в Telegram:', errorData)
        return false
      }

      console.log('✅ Уведомление отправлено в Telegram')
      return true
    } catch (error) {
      console.error('❌ Ошибка отправки в Telegram:', error)
      return false
    }
  }

  // 💬 Уведомление о новом сообщении в чате
  async sendChatNotification(data: ChatNotification): Promise<boolean> {
    const { sessionId, senderName, message, isFromUser, timestamp } = data
    
    const emoji = isFromUser ? '👤' : '👨‍💼'
    const typeLabel = isFromUser ? 'КЛИЕНТ' : 'МЕНЕДЖЕР'
    const timeStr = timestamp.toLocaleString('ru-RU', { 
      timeZone: 'Europe/Moscow',
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

    const text = `${emoji} <b>НОВОЕ СООБЩЕНИЕ В ЧАТЕ</b>

<b>Тип:</b> ${typeLabel}
<b>От:</b> ${senderName}
<b>Время:</b> ${timeStr}
<b>Сессия:</b> ${sessionId}

<b>Сообщение:</b>
${message}

${isFromUser ? '🔥 <b>Требуется ответ менеджера!</b>' : '✅ Ответ от менеджера'}`

    return this.sendMessage({
      chat_id: this.chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    })
  }

  // 🛒 Уведомление о новом заказе
  async sendOrderNotification(data: OrderNotification): Promise<boolean> {
    const { 
      orderNumber, 
      customerName, 
      customerPhone, 
      customerEmail,
      total, 
      items, 
      address,
      paymentMethod,
      shippingMethod 
    } = data
    
    const timeStr = new Date().toLocaleString('ru-RU', { 
      timeZone: 'Europe/Moscow',
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Форматируем список товаров
    const itemsList = items.map((item, index) => 
      `${index + 1}. ${item.productName}\n   Кол-во: ${item.quantity} шт.\n   Цена: ${formatPrice(item.price)}`
    ).join('\n\n')

    const text = `🛒 <b>НОВЫЙ ЗАКАЗ!</b>

<b>Номер заказа:</b> ${orderNumber}
<b>Время:</b> ${timeStr}

<b>КЛИЕНТ:</b>
👤 <b>Имя:</b> ${customerName}
${customerPhone ? `📞 <b>Телефон:</b> ${customerPhone}` : ''}
${customerEmail ? `📧 <b>Email:</b> ${customerEmail}` : ''}

<b>ТОВАРЫ:</b>
${itemsList}

<b>💰 ИТОГО: ${formatPrice(total)}</b>

${address ? `<b>📦 Адрес доставки:</b>\n${address}` : ''}
${shippingMethod ? `<b>🚚 Способ доставки:</b> ${shippingMethod}` : ''}
${paymentMethod ? `<b>💳 Способ оплаты:</b> ${paymentMethod}` : ''}

🔥 <b>Требуется обработка заказа!</b>`

    return this.sendMessage({
      chat_id: this.chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    })
  }

  // 📋 Уведомление об изменении статуса заказа
  async sendOrderStatusNotification(orderNumber: string, oldStatus: string, newStatus: string, customerName: string): Promise<boolean> {
    const statusEmojis: Record<string, string> = {
      'PENDING': '⏳',
      'CONFIRMED': '✅',
      'PROCESSING': '⚙️',
      'SHIPPED': '🚚',
      'DELIVERED': '📦',
      'CANCELLED': '❌'
    }

    const statusNames: Record<string, string> = {
      'PENDING': 'Ожидает обработки',
      'CONFIRMED': 'Подтвержден',
      'PROCESSING': 'В обработке',
      'SHIPPED': 'Отправлен',
      'DELIVERED': 'Доставлен',
      'CANCELLED': 'Отменен'
    }

    const text = `📋 <b>ИЗМЕНЕНИЕ СТАТУСА ЗАКАЗА</b>

<b>Заказ:</b> ${orderNumber}
<b>Клиент:</b> ${customerName}
<b>Время:</b> ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}

<b>Статус изменен:</b>
${statusEmojis[oldStatus] || '⭕'} ${statusNames[oldStatus] || oldStatus} → ${statusEmojis[newStatus] || '⭕'} ${statusNames[newStatus] || newStatus}`

    return this.sendMessage({
      chat_id: this.chatId,
      text,
      parse_mode: 'HTML',
    })
  }
}

// Utility функция для форматирования цены
function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Экспортируем singleton экземпляр
export const telegramBot = new TelegramBot()

// Экспортируем типы для использования в других файлах
export type { ChatNotification, OrderNotification } 