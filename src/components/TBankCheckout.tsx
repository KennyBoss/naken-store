'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'

interface TBankCheckoutProps {
  orderId: string
  amount: number
  customerEmail?: string
  customerPhone?: string
  onPaymentStart?: () => void
  onPaymentError?: (error: string) => void
}

export default function TBankCheckout({ 
  orderId, 
  amount, 
  customerEmail,
  customerPhone,
  onPaymentStart,
  onPaymentError
}: TBankCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    setIsLoading(true)
    onPaymentStart?.()

    try {
      console.log('Initiating T-Bank payment...', { orderId, amount })

      const response = await fetch('/api/tbank/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          customerEmail,
          customerPhone
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка создания платежа')
      }

      if (result.success && result.paymentUrl) {
        console.log('T-Bank payment URL received:', result.paymentUrl)
        // Перенаправляем пользователя на платежную форму T-Bank
        window.location.href = result.paymentUrl
      } else {
        throw new Error('Не получен URL для оплаты')
      }

    } catch (error) {
      console.error('T-Bank payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при создании платежа'
      onPaymentError?.(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Т-Банк</h3>
          <p className="text-sm text-gray-600">T-Pay, SberPay, MirPay, СБП, банковские карты</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Сумма к оплате:</span>
            <span className="text-xl font-bold text-gray-900">
              {amount.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p>✓ T-Pay, SberPay, MirPay, СБП</p>
          <p>✓ Поддержка всех банковских карт</p>
          <p>✓ 3D Secure защита</p>
          <p>✓ Мгновенное зачисление средств</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Создание платежа...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Оплатить через Т-Банк
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Вы перейдете на защищенную страницу оплаты с выбором способа
        </p>
      </div>
    </div>
  )
} 