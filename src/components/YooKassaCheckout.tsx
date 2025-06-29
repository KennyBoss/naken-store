'use client'

import { useState } from 'react'
import { useToast } from '@/context/ToastContext'
import { CreditCard, Loader2, ExternalLink } from 'lucide-react'

interface YooKassaCheckoutProps {
  amount: number
  orderId: string
  onCancel?: () => void
}

export default function YooKassaCheckout({ amount, orderId, onCancel }: YooKassaCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { error, success } = useToast()

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch('/api/yookassa/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          orderId,
          description: `Оплата заказа #${orderId}`
        })
      })

      const data = await response.json()

      if (data.success && data.paymentUrl) {
        success('Переходим к оплате...')
        // Перенаправляем на страницу ЮKassa
        window.location.href = data.paymentUrl
      } else {
        error(data.error || 'Ошибка создания платежа')
      }
    } catch (err) {
      error('Ошибка соединения с сервером')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-5 h-5 text-teal-500" />
        <h3 className="text-lg font-medium">Оплата картой</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">К оплате:</span>
            <span className="text-2xl font-bold text-gray-900">
              {amount.toLocaleString()} ₽
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p className="mb-2">💳 <strong>Принимаем карты:</strong></p>
          <div className="flex gap-2 mb-3">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">МИР</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Visa</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">MasterCard</span>
          </div>
          <p className="text-xs">
            🔒 Безопасная оплата через ЮMoney (Яндекс.Касса)
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1 bg-teal-500 text-white py-3 rounded-lg font-medium hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Создание платежа...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Оплатить {amount.toLocaleString()} ₽
              </>
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          После нажатия кнопки вы будете перенаправлены на безопасную страницу ЮMoney
        </div>
      </div>
    </div>
  )
} 