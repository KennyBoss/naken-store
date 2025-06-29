'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Settings, Package, MapPin, Bookmark, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/profile')
      return
    }

    if (session?.user) {
      loadOrders()
    }
  }, [status, session, router])

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.slice(0, 3)) // Показываем только последние 3 заказа
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const menuItems = [
    {
      title: 'Мои заказы',
      description: 'История покупок и статус заказов',
      href: '/profile/orders',
      icon: Package,
      count: orders.length
    },
    {
      title: 'Адреса доставки',
      description: 'Управление адресами доставки',
      href: '/profile/addresses',
      icon: MapPin
    },
    {
      title: 'Сохраненные',
      description: 'Товары, отложенные для покупки',
      href: '/profile/wishlist',
      icon: Bookmark
    },
    {
      title: 'Настройки профиля',
      description: 'Личная информация и настройки',
      href: '/profile/settings',
      icon: Settings
    }
  ]

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-8 w-8 text-teal-500" />
            <h1 className="text-3xl font-light text-gray-900">Мой профиль</h1>
          </div>
          <p className="text-gray-600 font-light">
            Добро пожаловать, {session.user.name || session.user.email || session.user.phone}!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {session.user.name || 'Пользователь'}
                </h3>
                <p className="text-gray-500 text-sm font-light">{session.user.email || session.user.phone}</p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-light">Всего заказов</span>
                    <span className="text-xl font-semibold text-teal-600">{orders.length}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-light">Статус</span>
                    <span className="text-sm font-medium text-green-600">Активный</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {menuItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                        <IconComponent size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                          {item.count !== undefined && (
                            <span className="bg-teal-100 text-teal-600 text-xs px-2 py-1 rounded-full font-medium">
                              {item.count}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm font-light">{item.description}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-medium text-gray-900">Последние заказы</h2>
                {orders.length > 0 && (
                  <Link
                    href="/profile/orders"
                    className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    Смотреть все →
                  </Link>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">У вас пока нет заказов</h3>
                  <p className="text-gray-500 mb-6 font-light">Начните покупки в нашем магазине</p>
                  <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300"
                  >
                    Перейти к покупкам
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Заказ #{order.orderNumber}</p>
                          <p className="text-gray-500 text-sm font-light">
                            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">{order.total}₽</p>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            order.status === 'DELIVERED' 
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status === 'PENDING' && 'В обработке'}
                            {order.status === 'PROCESSING' && 'Готовится'}
                            {order.status === 'SHIPPED' && 'Отправлен'}
                            {order.status === 'DELIVERED' && 'Доставлен'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 