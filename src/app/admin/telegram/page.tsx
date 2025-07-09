'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, MessageCircle, Package, Settings } from 'lucide-react'
import Link from 'next/link'

export default function TelegramTestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Проверка прав доступа
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/admin/telegram')
    return null
  }

  if (session?.user?.role !== 'ADMIN') {
    router.push('/')
    return null
  }

  // Тестовое сообщение в чат
  const testChatNotification = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/telegram/test-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chat',
          senderName: session.user.name || 'Тестовый админ',
          message: 'Это тестовое сообщение от админа для проверки Telegram уведомлений!'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage('✅ Тестовое уведомление о чате отправлено!')
      } else {
        setMessage(`❌ Ошибка: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Ошибка отправки уведомления')
    } finally {
      setLoading(false)
    }
  }

  // Тестовый заказ
  const testOrderNotification = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/telegram/test-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage('✅ Тестовое уведомление о заказе отправлено!')
      } else {
        setMessage(`❌ Ошибка: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Ошибка отправки уведомления')
    } finally {
      setLoading(false)
    }
  }

  // Проверка статуса конфигурации
  const checkTelegramConfig = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/telegram/status')
      const data = await response.json()
      
      if (response.ok) {
        if (data.configured) {
          setMessage('✅ Telegram бот настроен и готов к работе!')
        } else {
          setMessage('⚠️ Telegram бот не настроен. Проверьте переменные окружения.')
        }
      } else {
        setMessage(`❌ Ошибка проверки: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Ошибка проверки конфигурации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                Назад в админку
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Send className="h-6 w-6 text-blue-500" />
                  Telegram уведомления
                </h1>
                <p className="text-gray-600">Настройка и тестирование уведомлений</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.startsWith('✅') 
              ? 'bg-green-50 border-green-200 text-green-800'
              : message.startsWith('⚠️')
                ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Configuration Check */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">Проверка конфигурации</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Проверьте настройки Telegram бота и переменные окружения
          </p>
          <button
            onClick={checkTelegramConfig}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Проверка...' : 'Проверить настройки'}
          </button>
        </div>

        {/* Test Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chat Test */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-medium text-gray-900">Тест чата</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Отправить тестовое уведомление о новом сообщении в чате
            </p>
            <button
              onClick={testChatNotification}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} />
              {loading ? 'Отправка...' : 'Тест сообщения в чате'}
            </button>
          </div>

          {/* Order Test */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-medium text-gray-900">Тест заказа</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Отправить тестовое уведомление о новом заказе
            </p>
            <button
              onClick={testOrderNotification}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-green-400 flex items-center justify-center gap-2"
            >
              <Package size={16} />
              {loading ? 'Отправка...' : 'Тест нового заказа'}
            </button>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Инструкция по настройке</h2>
          <div className="prose max-w-none text-gray-600">
            <ol className="list-decimal list-inside space-y-2">
              <li>Создайте Telegram бота через @BotFather</li>
              <li>Получите токен бота</li>
              <li>Получите Chat ID (личный или группы)</li>
              <li>Добавьте переменные в .env файл:</li>
            </ol>
            <div className="bg-gray-50 p-4 rounded-lg mt-4 font-mono text-sm">
              TELEGRAM_BOT_TOKEN=ваш_токен_бота<br/>
              TELEGRAM_CHAT_ID=ваш_chat_id
            </div>
            <p className="mt-4">
              📋 <strong>Подробная инструкция:</strong> см. файл <code>TELEGRAM_SETUP.md</code> в корне проекта
            </p>
          </div>
        </div>

        {/* Active Features */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Активные уведомления</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Чат</div>
                <div className="text-sm text-blue-700">Новые сообщения</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Package className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Заказы</div>
                <div className="text-sm text-green-700">Новые заказы</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Settings className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium text-purple-900">Статусы</div>
                <div className="text-sm text-purple-700">Изменения статуса</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 