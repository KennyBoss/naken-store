'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, CreditCard, Home } from 'lucide-react'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }

    // Загружаем детали заказа
    const loadOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const data = await response.json()
          setOrderDetails(data.order)
        }
      } catch (error) {
        console.error('Ошибка загрузки заказа:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrderDetails()
  }, [orderId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Успешное сообщение */}
        <div className="bg-white rounded-lg p-8 shadow-sm text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Оплата прошла успешно!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Спасибо за ваш заказ. Мы отправили подтверждение на вашу электронную почту.
          </p>

          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Номер заказа:</span>
                <span className="font-mono font-medium">#{orderDetails.orderNumber}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-600">Сумма:</span>
                <span className="font-medium text-lg">
                  {(orderDetails.total + orderDetails.shippingFee).toLocaleString()} ₽
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Что дальше */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Что происходит дальше?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-teal-600">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Подтверждение заказа</h3>
                <p className="text-gray-600 text-sm">
                  Мы проверяем наличие товаров и подготавливаем ваш заказ к отправке
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Упаковка и отправка</h3>
                <p className="text-gray-600 text-sm">
                  Ваш заказ будет упакован и передан курьерской службе в течение 1-2 дней
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CreditCard className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Доставка</h3>
                <p className="text-gray-600 text-sm">
                  Курьер свяжется с вами для согласования времени доставки
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/profile/orders"
            className="flex-1 bg-teal-500 text-white py-3 px-6 rounded-lg text-center font-medium hover:bg-teal-600 transition-colors"
          >
            Мои заказы
          </Link>
          
          <Link
            href="/"
            className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg text-center font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            На главную
          </Link>
        </div>

        {/* Поддержка */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Есть вопросы? <a href="mailto:support@naken.store" className="text-teal-600 hover:underline">Напишите нам</a></p>
          <p className="mt-1">или позвоните: <a href="tel:+78001234567" className="text-teal-600 hover:underline">+7 (920) 994-07-07-</a></p>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
} 