'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, Loader2, Package, CreditCard, ShoppingCart, User, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// Простой компонент инпута для стилизации
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 focus:bg-white ${props.className}`}
  />
)

export default function SimpleCheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, total, clearCart } = useCart()
  const { success, error } = useToast()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    comment: '',
    paymentMethod: 'cash',
  })

  // Загрузка данных профиля при авторизации
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        phone: session.user.phone || '',
      }))
    }
  }, [session])

  // Редирект, если корзина пуста
  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      router.replace('/cart')
    }
  }, [items.length, isProcessing, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Обработчик заказа
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      error('Пожалуйста, заполните Имя, Телефон и Адрес доставки.')
      return
    }
    
    setIsProcessing(true)

    const orderData = {
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.salePrice || item.product.price
      })),
      address: {
        fullName: formData.name,
        phone: formData.phone,
        street: formData.address,
      },
      shippingMethod: 'standard',
      paymentMethod: formData.paymentMethod,
      comment: formData.comment,
      totalAmount: total,
    }

    try {
      const response = await fetch('/api/orders/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось создать заказ.')
      }

      const result = await response.json()
      await clearCart()
      success(`Заказ #${result.order.orderNumber} успешно создан! Мы скоро свяжемся с вами.`)
      router.push(`/profile/orders/${result.order.id}`)

    } catch (err: any) {
      console.error('Ошибка создания заказа:', err)
      error(err.message || 'Произошла ошибка при создании заказа.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-teal-500" size={48} />
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        
        <Link href="/cart" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6">
          <ArrowLeft size={18} />
          Вернуться в корзину
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Левая часть - Форма */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Оформление заказа</h1>
            
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {/* Контактная информация */}
              <div className="space-y-3">
                <label className="font-semibold text-gray-700 flex items-center gap-2"><User size={16}/>Контактная информация</label>
                <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Ваше имя" required />
                <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Номер телефона" required />
              </div>
              
              {/* Адрес доставки */}
              <div className="space-y-3">
                <label className="font-semibold text-gray-700 flex items-center gap-2"><MapPin size={16}/>Адрес доставки</label>
                <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="Город, улица, дом, квартира" required />
              </div>

              {/* Комментарий */}
              <div className="space-y-3">
                 <label htmlFor="comment" className="font-semibold text-gray-700">Комментарий к заказу</label>
                 <textarea
                   id="comment"
                   name="comment"
                   value={formData.comment}
                   onChange={handleInputChange}
                   rows={3}
                   placeholder="Например, код домофона или удобное время доставки"
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                 />
              </div>

              {/* Оплата */}
              <div className="space-y-3">
                <label className="font-semibold text-gray-700">Оплата</label>
                <div className="bg-white p-4 rounded-lg border border-teal-500">
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-teal-500" />
                    <div>
                      <p className="font-medium text-gray-800">Оплата при получении</p>
                      <p className="text-sm text-gray-500">Наличными или картой курьеру</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Согласие на обработку данных */}
              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mt-1" 
                    required 
                  />
                  <span>
                    Оформляя заказ, я соглашаюсь с{' '}
                    <Link href="/privacy" className="text-teal-600 hover:underline">
                      политикой конфиденциальности
                    </Link>
                    {' '}и{' '}
                    <Link href="/offer" className="text-teal-600 hover:underline">
                      публичной офертой
                    </Link>
                    , а также даю согласие на обработку персональных данных.
                  </span>
                </label>
              </div>

              {/* Кнопка заказа */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-teal-500 text-white font-bold py-4 rounded-lg hover:bg-teal-600 transition-all duration-300 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <Package />}
                {isProcessing ? 'Обрабатываем...' : `Заказать на ${formatPrice(total)}`}
              </button>
            </form>
          </div>

          {/* Правая часть - Состав заказа */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><ShoppingCart size={20}/>Ваш заказ</h2>
            <div className="space-y-4">
              {items.map(item => {
                if (!item.product) return null; // Защита от отсутствия данных
                return (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gray-50">
                      <Image 
                        src={JSON.parse(item.product.images || '[]')[0] || '/api/placeholder/80/80'}
                        alt={item.product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.product.name}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Кол-во: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice( (item.product.salePrice || item.product.price) * item.quantity )}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <hr className="my-6 border-gray-200" />
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Товары ({items.length})</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Доставка</span>
                <span className="font-medium text-green-600">Бесплатно</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                <span>Итого</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
} 