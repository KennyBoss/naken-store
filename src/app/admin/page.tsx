'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Calendar,
  Plus,
  Eye,
  Settings,
  Code,
  Send
} from 'lucide-react'
import Link from 'next/link'

interface AdminStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  recentOrders: any[]
  topProducts: any[]
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin')
      return
    }
    
    if (session?.user?.role !== 'ADMIN') {
      router.push('/')
      return
    }

    loadStats()
  }, [status, session, router])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Админ-панель</h1>
              <p className="text-gray-600">Управление интернет-магазином NAKEN</p>
            </div>
            <Link
              href="/"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              На сайт
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/admin/products/new"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500"
          >
            <div className="flex items-center">
              <Plus className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Добавить</p>
                <p className="text-lg font-semibold text-gray-900">Новый товар</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-500"
          >
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Управление</p>
                <p className="text-lg font-semibold text-gray-900">Товары</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-yellow-500"
          >
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Просмотр</p>
                <p className="text-lg font-semibold text-gray-900">Заказы</p>
              </div>
            </div>
          </Link>

          {/* 🚀 НОВАЯ КАРТОЧКА TELEGRAM */}
          <Link
            href="/admin/telegram"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-600"
          >
            <div className="flex items-center">
              <Send className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Настройка</p>
                <p className="text-lg font-semibold text-gray-900">Telegram</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/admin/users"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-indigo-500"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Управление</p>
                <p className="text-lg font-semibold text-gray-900">Пользователи</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-teal-500"
          >
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-teal-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Настройки</p>
                <p className="text-lg font-semibold text-gray-900">Сайта</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/analytics/sizes-colors"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-pink-500"
          >
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-pink-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Аналитика</p>
                <p className="text-lg font-semibold text-gray-900">Размеры и цвета</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/pixels"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-purple-500"
          >
            <div className="flex items-center">
              <Code className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Трекинг</p>
                <p className="text-lg font-semibold text-gray-900">Пиксели</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Всего товаров
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.totalProducts || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCart className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Всего заказов
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.totalOrders || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Выручка
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.totalRevenue || 0} ₽
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Пользователи
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.totalUsers || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Последние заказы
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Пока нет заказов</p>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Популярные товары
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Статистика пока недоступна</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 