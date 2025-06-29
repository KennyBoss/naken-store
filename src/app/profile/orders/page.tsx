'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, Calendar, Tag, ChevronRight, Loader2, ShoppingCart } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { formatPrice } from '@/lib/utils'
import type { OrderWithItems } from '@/types' // Предполагаем, что такой тип есть

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { text: 'В обработке', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Loader2 size={14} className="animate-spin" /> }
    case 'PROCESSING':
      return { text: 'Готовится', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Package size={14} /> }
    case 'SHIPPED':
      return { text: 'Отправлен', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Package size={14} /> }
    case 'DELIVERED':
      return { text: 'Доставлен', color: 'bg-green-100 text-green-800 border-green-200', icon: <Package size={14} /> }
    case 'CANCELLED':
      return { text: 'Отменен', color: 'bg-red-100 text-red-800 border-red-200', icon: <Package size={14} /> }
    default:
      return { text: status, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Package size={14} /> }
  }
}

// Карточка заказа
const OrderCard = ({ order }: { order: OrderWithItems }) => {
  const statusInfo = getStatusInfo(order.status)
  
  // Безопасное получение изображения
  let firstItemImage = '/api/placeholder/80/80'
  try {
    if (order.items?.[0]?.product?.images) {
      const images = typeof order.items[0].product.images === 'string' 
        ? JSON.parse(order.items[0].product.images)
        : order.items[0].product.images
      
      if (Array.isArray(images) && images.length > 0) {
        firstItemImage = images[0]
      }
    }
  } catch (error) {
    console.warn('Ошибка парсинга изображений:', error)
  }

  return (
    <Link href={`/profile/orders/${order.id}`} className="block group">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
        <div className="flex items-center gap-6">
          {/* Изображение товара */}
          <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden border border-gray-100 flex-shrink-0 group-hover:shadow-md transition-shadow">
            <Image 
              src={firstItemImage} 
              alt={`Заказ ${order.orderNumber || order.id.slice(-8)}`} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => console.warn('Ошибка загрузки изображения для заказа:', order.id)}
            />
          </div>

          {/* Основная информация */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg group-hover:text-gray-700 transition-colors">
                  Заказ #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <Calendar size={14} />
                  {format(new Date(order.createdAt), 'd MMMM yyyy', { locale: ru })}
                </p>
              </div>
              <div className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full ${statusInfo.color} border shadow-sm`}>
                {statusInfo.icon}
                <span>{statusInfo.text}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Package size={14} />
                  {order.items?.length || 0} товар(а)
                </p>
                <p className="text-sm text-gray-400">•</p>
                <p className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  {formatPrice(order.total)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Стрелка с анимацией */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gradient-to-r group-hover:from-teal-50 group-hover:to-cyan-50 transition-all duration-300">
            <ChevronRight className="text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all duration-300" size={20} />
          </div>
        </div>
      </div>
    </Link>
  )
}


export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Ждем окончания загрузки сессии
    if (status === 'loading') {
      return; 
    }
    
    // Если не авторизован - редирект
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/profile/orders');
      return;
    }

    // Если авторизован - грузим данные
    if (status === 'authenticated' && session?.user) {
      setLoading(true);
      fetch('/api/orders')
        .then(res => {
          if (!res.ok) {
            throw new Error(`Ошибка HTTP: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Загруженные заказы:', data);
          setOrders(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error("Не удалось загрузить заказы:", err);
          setOrders([]); // Устанавливаем пустой массив при ошибке
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 via-white to-teal-50/30 min-h-screen">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            {/* Анимированный индикатор */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-200 to-cyan-200 rounded-full w-16 h-16 animate-ping opacity-20"></div>
              <div className="relative bg-white rounded-full w-16 h-16 flex items-center justify-center border border-gray-100 shadow-sm">
                <Loader2 className="animate-spin text-teal-600" size={32} />
              </div>
            </div>
            <h2 className="text-xl font-light text-gray-900 mb-2">Загружаем ваши заказы</h2>
            <p className="text-gray-500">Пожалуйста, подождите...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-teal-50/30 min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link href="/profile" className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors mb-8 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Назад в профиль</span>
        </Link>
        
        {/* Современный заголовок */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-3">Мои заказы</h1>
          <p className="text-gray-600 max-w-2xl">
            Отслеживайте статус ваших заказов, просматривайте историю покупок и управляйте возвратами
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 px-6">
            {/* Анимированная иконка */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full w-24 h-24 mx-auto animate-pulse"></div>
              <div className="relative bg-white rounded-full w-24 h-24 mx-auto flex items-center justify-center border border-gray-100 shadow-sm">
                <ShoppingCart size={40} className="text-gray-400" />
              </div>
            </div>
            
            {/* Заголовок и описание */}
            <h2 className="text-2xl font-light text-gray-900 mb-3">Здесь пока пусто</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Все ваши будущие заказы будут отображаться на этой странице. 
              Начните с выбора понравившихся товаров в нашем каталоге.
            </p>
            
            {/* Современные кнопки */}
            <div className="space-y-3 max-w-xs mx-auto">
              <Link
                href="/cart"
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium px-8 py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Перейти в корзину
              </Link>
              <Link
                href="/"
                className="w-full bg-white text-gray-700 font-medium px-8 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                На главную
              </Link>
            </div>
            
            {/* Дополнительная информация */}
            <div className="mt-12 text-center">
              <p className="text-sm text-gray-400 mb-4">💡 Совет</p>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Добавляйте товары в избранное, чтобы не потерять понравившиеся модели
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Статистика заказов */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Package className="text-teal-600" size={24} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                <p className="text-gray-600 text-sm">Всего заказов</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Package className="text-green-600" size={24} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'DELIVERED').length}</p>
                <p className="text-gray-600 text-sm">Доставлено</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Package className="text-blue-600" size={24} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{orders.filter(o => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.status)).length}</p>
                <p className="text-gray-600 text-sm">В процессе</p>
              </div>
            </div>

            {/* Список заказов */}
            <div className="space-y-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 