'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, User } from 'lucide-react'
import Image from 'next/image'
// import toast from 'react-hot-toast' // Заменили на кастомный useToast

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  shippingMethod: string
  paymentMethod: string
  notes: string
  agreedToTerms: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const { success, error } = useToast()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Москва',
    postalCode: '',
    shippingMethod: 'standard',
    paymentMethod: 'tbank',
    notes: '',
    agreedToTerms: false
  })

  const shippingMethods = [
    { id: 'moscow', name: 'Доставка по Москве', price: 500, time: 'В день заказа' },
    { id: 'cdek', name: 'СДЭК', price: 300, time: '2-5 дней' },
    { id: 'russian_post', name: 'Почта России', price: 500, time: '5-10 дней' },
    { id: 'pickup', name: 'Самовывоз', price: 0, time: 'По договоренности' },
  ]

  const paymentMethods = [
    { id: 'tbank', name: 'T-Pay (Т-Банк)', icon: CreditCard },
    { id: 'card', name: 'Банковская карта (YooKassa)', icon: CreditCard },
    { id: 'cash', name: 'Оплата при получении', icon: Truck },
  ]

  // Устанавливаем mounted состояние
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Проверяем пустую корзину только после монтирования
  useEffect(() => {
    if (isMounted && items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router, isMounted])

  if (!isMounted || items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    )
  }

  const selectedShipping = shippingMethods.find(m => m.id === formData.shippingMethod)
  const shippingCost = selectedShipping?.price || 0
  const totalCost = total + shippingCost

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Простая валидация
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address) {
      error('Пожалуйста, заполните все обязательные поля')
      return
    }

    if (!formData.agreedToTerms) {
      error('Необходимо согласиться с условиями и правилами')
      return
    }

    setIsProcessing(true)

    try {
      // Создаем заказ через API
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.salePrice || item.product.price,
          size: item.sizeId ? item.product.sizes.find(s => s.sizeId === item.sizeId)?.size?.name : null,
          color: item.product.color?.name || null
        })),
        address: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.address,
          city: formData.city,
          zipCode: formData.postalCode,
          phone: formData.phone
        },
        shippingMethod: formData.shippingMethod,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const result = await response.json()
        
        // Если выбрана оплата через T-Bank, перенаправляем на оплату
        if (formData.paymentMethod === 'tbank') {
          try {
            // Проверяем корректность суммы
            if (!totalCost || totalCost <= 0) {
              throw new Error('Некорректная сумма заказа для оплаты')
            }

            console.log('🏦 Создаем T-Bank платеж:', {
              orderId: result.order.id,
              amount: totalCost,
              customerEmail: formData.email,
              customerPhone: formData.phone
            })

            const paymentResponse = await fetch('/api/tbank/create-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: result.order.id,
                amount: totalCost,
                customerEmail: formData.email,
                customerPhone: formData.phone
              })
            })

            const paymentResult = await paymentResponse.json()

            console.log('🏦 T-Bank ответ:', {
              status: paymentResponse.status,
              ok: paymentResponse.ok,
              result: paymentResult
            })

            if (paymentResponse.ok && paymentResult.success && paymentResult.paymentUrl) {
              // Показываем успешное сообщение
              success(`Заказ создан! Номер: #${result.order.orderNumber}. Переходим к оплате...`)
              
              // Очищаем корзину (безопасно)
              try {
                await clearCart()
              } catch (clearError) {
                console.error('Ошибка очистки корзины:', clearError)
                // Не критично - корзина очистится при следующем обновлении
              }
              
              // Перенаправляем на T-Bank
              setTimeout(() => {
                window.location.href = paymentResult.paymentUrl
              }, 1500)
            } else {
              const errorMsg = paymentResult.error || `HTTP ${paymentResponse.status}: Ошибка создания платежа`
              console.error('❌ T-Bank payment failed:', errorMsg)
              throw new Error(errorMsg)
            }
          } catch (paymentError) {
            console.error('T-Bank payment error:', paymentError)
            console.error('Order was created but payment failed. Order ID:', result.order.id)
            error(`Заказ #${result.order.orderNumber} создан, но ошибка при создании платежа. Обратитесь в поддержку.`)
          }
        } else {
          // Для других способов оплаты - стандартная логика
          success(`Заказ успешно оформлен! Номер заказа: #${result.order.orderNumber}`)
          
          // Очищаем корзину (безопасно)
          try {
            await clearCart()
          } catch (clearError) {
            console.error('Ошибка очистки корзины:', clearError)
            // Не критично - корзина очистится при следующем обновлении
          }
          
          // Перенаправляем на главную через 2 секунды
          setTimeout(() => {
            router.push('/')
          }, 2000)
        }
      } else {
        throw new Error('Ошибка создания заказа')
      }
    } catch (err) {
      console.error('Ошибка оформления заказа:', err)
      error('Произошла ошибка при оформлении заказа')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-all duration-300 backdrop-blur-sm bg-white/20 border border-white/30 rounded-full px-4 py-2 hover:bg-white/40"
          >
            <ArrowLeft size={18} />
            Назад
          </button>
          <h1 className="text-3xl font-light text-gray-800">Оформление заказа</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Форма заказа */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Личные данные */}
              <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl p-6 hover:bg-white/30 transition-all duration-300">
                <h2 className="text-xl font-light mb-6 flex items-center gap-3 text-gray-800">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <User size={20} className="text-gray-700" />
                  </div>
                  Личные данные
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-3">
                      Имя *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full backdrop-blur-sm bg-white/30 border border-white/40 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-3">
                      Фамилия *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full backdrop-blur-sm bg-white/30 border border-white/40 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-3">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full backdrop-blur-sm bg-white/30 border border-white/40 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-3">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+7 (999) 999-99-99"
                      className="w-full backdrop-blur-sm bg-white/30 border border-white/40 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Адрес доставки */}
              <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl p-6 hover:bg-white/30 transition-all duration-300">
                <h2 className="text-xl font-light mb-6 flex items-center gap-3 text-gray-800">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MapPin size={20} className="text-gray-700" />
                  </div>
                  Адрес доставки
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-3">
                      Адрес *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Улица, дом, квартира"
                      className="w-full backdrop-blur-sm bg-white/30 border border-white/40 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-light text-gray-700 mb-3">
                        Город *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full backdrop-blur-sm bg-white/30 border border-white/40 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-light text-gray-700 mb-3">
                        Почтовый индекс
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className="w-full backdrop-blur-sm bg-white/30 border border-white/40 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Способ доставки */}
              <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl p-6 hover:bg-white/30 transition-all duration-300">
                <h2 className="text-xl font-light mb-6 flex items-center gap-3 text-gray-800">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Truck size={20} className="text-gray-700" />
                  </div>
                  Способ доставки
                </h2>
                
                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                        formData.shippingMethod === method.id
                          ? 'border-teal-500/50 bg-teal-50/30 shadow-lg'
                          : 'border-white/40 bg-white/10 hover:bg-white/20 hover:border-white/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={method.id}
                        checked={formData.shippingMethod === method.id}
                        onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                        className="mr-4 accent-teal-500"
                      />
                      <div className="flex-1">
                        <div className="font-light text-gray-800">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.time}</div>
                      </div>
                      <div className="font-light text-gray-800">
                        {method.price === 0 ? 'Бесплатно' : formatPrice(method.price)}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Способ оплаты */}
              <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl p-6 hover:bg-white/30 transition-all duration-300">
                <h2 className="text-xl font-light mb-6 flex items-center gap-3 text-gray-800">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CreditCard size={20} className="text-gray-700" />
                  </div>
                  Способ оплаты
                </h2>
                
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                          formData.paymentMethod === method.id
                            ? 'border-teal-500/50 bg-teal-50/30 shadow-lg'
                            : 'border-white/40 bg-white/10 hover:bg-white/20 hover:border-white/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          className="mr-4 accent-teal-500"
                        />
                        <div className="p-2 bg-white/20 rounded-lg mr-3">
                          <Icon size={18} className="text-gray-700" />
                        </div>
                        <span className="font-light text-gray-800">{method.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </form>
          </div>

          {/* Сводка заказа */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl p-6 hover:bg-white/30 transition-all duration-300 sticky top-4">
              <h2 className="text-xl font-light mb-6 text-gray-800">Ваш заказ</h2>
              
              {/* Товары */}
              <div className="space-y-4 mb-6">
                {items.map((item) => {
                  let images = []
                  try {
                    images = JSON.parse(item.product.images || '[]')
                  } catch (e) {
                    images = []
                  }
                  
                  return (
                    <div key={item.id} className="flex items-center py-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-md overflow-hidden">
                        <Image
                          src={images[0] || '/api/placeholder/64/64'}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">Количество: {item.quantity}</p>
                        {/* {item.size && <p className="text-sm text-gray-500">Размер: {item.size}</p>} */}
                        {/* {item.color && <p className="text-sm text-gray-500">Цвет: {item.color}</p>} */}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Итого */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Товары</span>
                  <span>{formatPrice(total)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Доставка</span>
                  <span>{shippingCost === 0 ? 'Бесплатно' : formatPrice(shippingCost)}</span>
                </div>
                
                <hr />
                
                <div className="flex justify-between text-lg font-medium">
                  <span>Итого</span>
                  <span>{formatPrice(totalCost)}</span>
                </div>
              </div>

              {/* Согласие на обработку данных */}
              <div className="border-t border-white/30 pt-4 mt-4">
                <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-teal-500" 
                    checked={formData.agreedToTerms}
                    onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                    required 
                  />
                  <span className="font-light">
                    Оформляя заказ, я соглашаюсь с{' '}
                    <Link href="/privacy" className="text-teal-600 hover:text-teal-700 transition-colors">
                      политикой конфиденциальности
                    </Link>
                    {' '}и{' '}
                    <Link href="/offer" className="text-teal-600 hover:text-teal-700 transition-colors">
                      публичной офертой
                    </Link>
                    , а также даю согласие на обработку персональных данных.
                  </span>
                </label>
              </div>

              {/* Кнопка оформления */}
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !formData.agreedToTerms}
                className="w-full backdrop-blur-sm bg-gradient-to-r from-teal-500/90 to-cyan-500/90 text-white py-4 mt-6 rounded-xl font-light text-lg border border-white/20 hover:from-teal-600/90 hover:to-cyan-600/90 hover:shadow-lg transition-all duration-300 disabled:from-gray-400/90 disabled:to-gray-500/90 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Оформляем заказ...' : `Оформить заказ на ${formatPrice(totalCost)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 